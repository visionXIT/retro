import { Injectable } from '@nestjs/common';
import { ApiError } from 'error/api.error';
import { HistoryEvent } from 'kafka/history/history.kafka';
import { LoggerEvent } from 'kafka/logger/logger.kafka';
import { IExchanger, LoggerType, OkxTokenType, ProblemWalletType, WithdrawConfigType } from 'types/types';
import { ZKSYNC_SUBSCRIBE_ID } from 'utils/config';
import { decryptData, encryptData } from 'utils/crypto';
import { getCourse, numDecimals } from 'utils/currencies';
import { changeAddress, generateId, getRandomFixedNumber, shuffle } from '../utils/utils';
import { OkxService } from './okx-withdraw';
import { WithdrawRepository } from './withdraw.repository';
import { lastValueFrom } from 'rxjs';

@Injectable()
export class WithdrawService {
  constructor(
    private _loggerEvent: LoggerEvent,
    private _okxService: OkxService,
    private _withdrawRepo: WithdrawRepository,
    private _historyEvent: HistoryEvent,
  ) {}

  public async checkOkxApi(passphrase: string, apiKey: string, secretKey: string) {
    try {
      await this._okxService.checkApi(passphrase, apiKey, secretKey);
      return true;
    } catch (error: unknown) {
      return false;
    }
  }

  public async getOkxTokensAndNetworks(): Promise<OkxTokenType[]> {
    return await this._okxService.getCurrencies();
  }

  public async getAllUserProcesses(userId: number) {
    const ids = await this._withdrawRepo.getUserProcesses(userId);
    const res = [];
    for (let i = 0; i < ids.length; i++) {
      res.push(await this._withdrawRepo.getAllProcessInfo(ids[i].id_process));
    }
    return res;
  }

  public async getProcessStatus(processId: string, userId: number) {
    await this._checkProcessId(processId);
    await this._checkProcessOwner(processId, userId);

    return this._withdrawRepo.getAllProcessInfo(processId);
  }

  private async _stopWithdrawing(processId: string) {
    const process = await this.getProcessInfo(processId);
    const logs = await this._getProcessLogs(processId);
    await this._accumulateHistory(processId, process.userId, logs);
    await this._withdrawRepo.clearWallets(processId);
    await this._withdrawRepo.changeProcessStatus(processId, 'disabled');
    await this._withdrawRepo.deleteProcess(processId);
  }


  public async withdrawFromOkx(
    wallets: string[],
    userId: number,
    settings: WithdrawConfigType,
    baseLogs: string[] = [],
  ): Promise<string> {
    const id = await this.createProcess(userId, encryptData(JSON.stringify(settings)), wallets.length);
    const isUserSubscribed = await this._withdrawRepo.checkUserSubscribe(userId);

    if (!isUserSubscribed) {
      throw ApiError.BadRequest('User is not subscribed');
    }

    this.withdrawToAllAddresses(wallets, settings, this._okxService, id, userId, baseLogs);
    return id;
  }

  public async stopWithdrawingFromOkx(processId: string, userId: number) {
    await this._checkProcessId(processId);
    await this._checkProcessOwner(processId, userId);

    const status = await this._withdrawRepo.getProcessStatus(processId);

    if (status === 'disabled') {
      throw ApiError.BadRequest('Your process is already stopped');
    }

    if (status === 'pause') {
      await this._stopWithdrawing(processId);

      return 'Successfully disabled';
    }

    await this._withdrawRepo.changeProcessStatus(processId, 'pause');
    return 'Successfully stopped';
  }

  public async restartWithdraw(processId: string, userId: number, config?: WithdrawConfigType) {
    await this._checkProcessId(processId);
    await this._checkProcessOwner(processId, userId);

    const process = await this.getProcessInfo(processId);
    const problemWallets = await this.getProblemWallets(processId);
    const status = await this._withdrawRepo.getProcessStatus(processId);

    if (status !== 'pause') {
      throw ApiError.BadRequest('Process finished');
    }
    const logs = await this._getProcessLogs(processId);
    await this._accumulateHistory(processId, process.userId, logs);
    await this._withdrawRepo.changeProcessStatus(processId, 'disabled');
    await this._withdrawRepo.clearWallets(processId);
    await this._withdrawRepo.deleteProcess(processId);
    const id = await this.withdrawFromOkx(problemWallets, process.userId, config ?? process.config);
    return id;
  }

  private async getProcessInfo(
    processId: string,
  ): Promise<{ config: WithdrawConfigType; userId: number; problemWallets: string }> {
    const process = await this._withdrawRepo.getProcessInfo(processId);
    return { ...process, config: JSON.parse(decryptData(process.config)) as WithdrawConfigType };
  }

  private async createProcess(userId: number, config: string, walletCount: number): Promise<string> {
    const id = generateId();
    const isUserExist = await this._withdrawRepo.checkUserId(userId);

    if (!isUserExist) {
      throw ApiError.NotFound('Cannot find your user');
    }
    await this._withdrawRepo.createProcess(id, userId, config, walletCount);
    return id;
  }

  private async withdrawToAllAddresses(
    wallets: string[],
    settings: WithdrawConfigType,
    exchanger: IExchanger,
    processId: string,
    userId: number,
    baseLogs: string[] = [],
  ) {
    if (settings.isShuffleWallets) {
      wallets = shuffle(wallets);
    }
    const historyLogs = [];
    let course;
    let decimals;
    let emergencyStopped = false;

    try {
      course = await getCourse(settings.ccy);
      decimals = numDecimals.get(settings.ccy);
      if (!decimals || !course) {
        throw new Error();
      }
    } catch (error: unknown) {
      await this._loggerEvent.addLogInLogList(
        {
          idProcess: processId,
          userId: userId,
          addressWallet: wallets,
          messageLog: 'Unsupported currency\n',
        },
        processId,
        userId,
      );
      historyLogs.push('Unsupported currency\n');
      await this._withdrawRepo.addProblemWallets(processId, this._createProblemWalletsString(wallets));
      return;
    }

    await this._withdrawRepo.changeProcessStatus(processId, 'enabled');

    const problemWallets: ProblemWalletType[] = [];

    await this._loggerEvent.addLogInLogList(
      {
        idProcess: processId,
        userId: userId,
        addressWallet: [],
        messageLog: 'Process started\n',
      },
      processId,
      userId,
    );

    historyLogs.push('Process started\n');

    for (const [index, destinationWallet] of wallets.entries()) {
      const status = await this._withdrawRepo.getProcessStatus(processId);
      if (status !== 'enabled') {
        await this._loggerEvent.addLogInLogList(
          {
            idProcess: processId,
            userId: userId,
            addressWallet: destinationWallet,
            messageLog: `The process was urgently stopped by the client. For the wallet ${destinationWallet} the withdrawing was not completed\n`,
          },
          processId,
          userId,
        );
        historyLogs.push(
          `The process was urgently stopped by the client. For the wallet ${changeAddress(
            destinationWallet,
          )} the withdrawing was not completed\n`,
        );
        emergencyStopped = true;
        wallets.slice(index).map(w => problemWallets.push({wallet: w, msg: "Emergency stop"}));
        
        break;
      }
      try {
        const amt = getRandomFixedNumber(settings.minWithdrawal, settings.maxWithdrawal, course, decimals);
        await this._loggerEvent.addLogInLogList(
          {
            idProcess: processId,
            userId: userId,
            addressWallet: destinationWallet,
            messageLog: `Withdraw from OKX to ${destinationWallet} started. Amount: ${(+amt / course).toFixed(2)}$\n`,
          },
          processId,
          userId,
        );
        historyLogs.push(`Withdraw from OKX to ${changeAddress(destinationWallet)} started. Amount: ${(+amt / course).toFixed(2)}$\n`);

        await exchanger.withdraw(destinationWallet, settings, amt);

        await this._loggerEvent.addLogInLogList(
          {
            idProcess: processId,
            userId: userId,
            addressWallet: destinationWallet,
            options: 'done',
            messageLog: `Successfully withdrawed to address: ${destinationWallet}\n============\n`,
          },
          processId,
          userId,
        );

        historyLogs.push(`Successfully withdrawed to address: ${changeAddress(destinationWallet)}\n============\n`);
      } catch (error: unknown) {
        const msg = (error as { message: string }).message;
        problemWallets.push({ wallet: destinationWallet, msg });

        historyLogs.push(
          `Error during withdrawing to address ${changeAddress(destinationWallet)}. ${error instanceof ApiError ? `Error message: ${msg}` : ''
          }\n============\n`,
        );

        await this._loggerEvent.addLogInLogList(
          {
            idProcess: processId,
            userId: userId,
            addressWallet: destinationWallet,
            options: 'done',
            messageLog: `Error during withdrawing to address ${destinationWallet}. ${error instanceof ApiError ? `Error message: ${msg}` : ''
              }\n============\n`,
          },
          processId,
          userId,
        );
      }

      const delay = +getRandomFixedNumber(settings.minDelay, settings.maxDelay, 1, { min: 1, max: 2 }) * 1000;
      await new Promise((resolve) => setTimeout(resolve, delay));
    }

    await this._addProcessLogs(processId, this._loggerEvent.getLogsLost(processId, userId));

    if (problemWallets.length) {
      await this._loggerEvent.addLogInLogList(
        {
          idProcess: processId,
          userId: userId,
          options: 'end',
          addressWallet: problemWallets.flatMap((wallet) => wallet.wallet),
          messageLog: `Problematic wallets: \n${problemWallets
            .map((wallet) => wallet.wallet + '\n').join('')
            } have been identified - Do you want to relaunch them?\n`,
        },
        processId,
        userId,
      );
      historyLogs.push(
        `Problematic wallets: \n${problemWallets
          .map((wallet) => changeAddress(wallet.wallet) + '\n').join('')} have been identified - Do you want to relaunch them?\n`,
      );

      await this._withdrawRepo.addProblemWallets(
        processId,
        this._createProblemWalletsString(problemWallets.flatMap((wallet) => wallet.wallet)),
      );
      await this._withdrawRepo.changeProcessStatus(processId, 'pause');
      await this._withdrawRepo.changeProblemWalletCount(processId, problemWallets.length);
      await this._withdrawRepo.addBrokenLogs(processId, JSON.stringify(historyLogs));
    } else {
      historyLogs.concat(baseLogs);
      await this._accumulateHistory(processId, userId, historyLogs);
      await this._withdrawRepo.addBrokenLogs(processId, JSON.stringify(historyLogs));
      await this._withdrawRepo.changeProcessStatus(processId, 'disabled');
    }

    await this._loggerEvent.addLogInLogList(
      {
        idProcess: processId,
        userId: userId,
        options: 'end',
        addressWallet: problemWallets.flatMap((wallet) => wallet.wallet),
        messageLog: 'The process ended\n',
      },
      processId,
      userId,
    );

    historyLogs.push('The process ended\n');

    if (emergencyStopped) {
      await this._stopWithdrawing(processId);
    }
  }

  public async getProblemWallets(processId: string) {
    await this._checkProcessId(processId);

    let wallets_string = await this._withdrawRepo.getProblemWallets(processId);

    if (!wallets_string) {
      return [];
    }

    wallets_string = decryptData(wallets_string);
    const problemWallets = wallets_string.split(' ');
    return problemWallets;
  }

  private async _addProcessLogs(processId: string, logs: LoggerType[]) {
    await this._withdrawRepo.addLogs(processId, JSON.stringify(logs));
  }

  private async _getProcessLogs(processId: string): Promise<string[]> {
    const logs = await this._withdrawRepo.getBrokenLogs(processId);
    if (!logs) {
      return [];
    }
    return JSON.parse(logs);
  }

  private async _accumulateHistory(processId: string, userId: number, logs: string[]) {
    console.log("accumulateHistory")
    const process = await this._withdrawRepo.getAllProcessInfo(processId);
    const options = process.options;
    try {
      await this._withdrawRepo.deleteClearLogs(processId);
    } catch (err) {
      console.log(err)
    }

    console.log(options);
    await lastValueFrom(
      await this._historyEvent.historyAddLogs({
        log: {
          processId,
          logs: logs.flatMap((log) => {
            return { messageLog: log, userId, idProcess: processId };
          }),
          userId,
          subscribeId: ZKSYNC_SUBSCRIBE_ID,
          options,
          to: options?.toNetwork,
          from: 'OKX',
          tokens: options?.symbol,
          nameProcess: 'Witdraw from OKX',
          walletCount: process.walletCount!,
          problemWalletCount: process.problemWalletCount!,
          amount: `min ${options?.delayAmount.minAmount} - max ${options?.delayAmount.maxAmount}`,
        },
      }),
    );

  }

  private async _checkProcessId(processId: string) {
    const isProcessExist = await this._withdrawRepo.checkProcessById(processId);

    if (!isProcessExist) {
      throw ApiError.NotFound('Cannot find your process');
    }
  }

  private async _checkProcessOwner(processId: string, userId: number) {
    const _userId = await this._withdrawRepo.getUserByProcessId(processId);
    if (userId !== _userId) {
      throw ApiError.NotFound('Cannot find your process');
    }
  }

  private _createProblemWalletsString(problemWallets: string[]) {
    let str = '';
    for (const wallet of problemWallets) {
      str += wallet + ' ';
    }
    str = str.substring(0, str.length - 2);
    return encryptData(str);
  }
}
