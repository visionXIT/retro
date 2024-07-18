import { lastValueFrom } from 'rxjs';
import { Wallet } from 'ethers';
import { ApiError } from 'error/api.error';
import { HistoryEvent, LoggerEvent, SubscribeEvent } from 'kafka';
import { MultiplicationRepository } from 'multiplication/multiplication.repository';
import { numDecimals } from 'multiplication/utils/utils-config';
import { UtilsContracts } from 'multiplication/utils/utils-contracts';
import { UtilsEcosystem } from 'multiplication/utils/utils-ecosystem.service';
import { UtilsBuildObjectForResponse } from 'multiplication/utils/utils-object-process-builder';
import { OptionType, ProcessStatus } from 'types/multiplication.types';
import { ExecBridgeOptionType, ExecCollectorOptionType, ExecSwapOptionType, ExecTransferOptionType } from 'types/operations.types';
import { LoggerType } from 'types/services.types';
import { ProblemFlowProcessType, ProcessSaveChangesLogsAndArtifactType, WorkFlowProcessType } from 'types/utils.types';
import { changeLog } from 'utils/addresses';
import { getCourse } from 'utils/currencies';
import { UtilsSyncSwap } from './zkSync/syncswap/utils/utils-syncswap';

export abstract class AbstractEcosystemClass {
  protected _walletList: Wallet[];
  protected _options: OptionType;
  protected _processStatus: ProcessStatus;
  protected _isPauseProcess: boolean;
  protected _isEmergencyStop: boolean;

  private _problemWallets: Wallet[];
  private _successWallet: number;
  // protected _repository: MultiplicationRepository;
  // protected _history: HistoryEvent;
  // protected _logger: LoggerEvent;
  // protected _subscribe: SubscribeEvent;

  constructor(
    processStatus: ProcessStatus,
    walletList: Wallet[],
    options: OptionType,
    protected readonly _history: HistoryEvent,
    protected readonly _logger: LoggerEvent,
    protected readonly _subscribe: SubscribeEvent,
    protected readonly _repository: MultiplicationRepository,
  ) {
    this._processStatus = processStatus;
    this._walletList = walletList;
    this._options = options;
    this._isPauseProcess = false;
    this._isEmergencyStop = false;

    this._successWallet = 0;
    this._problemWallets = [];
  }

  protected async _getProcessStatus(idProcess: string): Promise<ProcessStatus> {
    this._processStatus = await this._repository.checkingStatusProcess(idProcess, this._options.userId);
    return this._processStatus;
  }

  protected async _continuedProcess(idProcess: string, options?: OptionType) {
    if (options) {
      this._options = options;
    }

    this._enableProcess(idProcess);
  }

  protected async _enableProcess(idProcess: string): Promise<void> {
    const status = await this._repository.checkingStatusProcess(idProcess, this._options.userId);

    if (status === 'enabled') {
      return;
    }

    await this._repository.updateStatusProcess(idProcess, 'enabled');
  }

  protected async _disableProcess(idProcess: string): Promise<void> {
    const status = await this._repository.checkingStatusProcess(idProcess, this._options.userId);

    if (status === 'disabled') {
      return;
    }

    if (status === 'pause') {
      const subscribeId$ = await lastValueFrom(
        await this._subscribe.getSubscribeIdByName({
          name: this._options.ecoSystem.toLowerCase(),
        }),
      );
      await this._accumulateLogForHistory(subscribeId$.id, idProcess);
      await this._repository.updateStatusProcess(idProcess, 'disabled');

      return;
    }

    await this._repository.updateStatusProcess(idProcess, 'disabled');
    this._walletList = [];
  }

  protected async _pauseProcess(idProcess: string): Promise<void> {
    this._isPauseProcess = true;
    await this._repository.updateStatusProcess(idProcess, 'pause');
  }

  /**
   * @description algorithm for executing the swap process
   * @param {ExecSwapOptionType} param
   */
  protected async execSwaps({ wallets, options, customDelay, logic }: ExecSwapOptionType) {
    await this._loggerStartProcess();

    const { isShuffleWallet } = options;
    const { minSecond, maxSecond } = options.delayAction;
    const { minAmount, maxAmount } = options.delayAmount;
    const walletsList: Wallet[] = isShuffleWallet ? UtilsEcosystem.shufflePrivateKeys(wallets) : wallets;
    const courses = new Map<string, number>();
    const networkName: string = Array.isArray(options.fromNetwork) ? options.fromNetwork[0] : options.fromNetwork;
    const courseEth = await getCourse('ETH');
    courses.set('ETH', courseEth);

    for (const wallet of walletsList) {
      try {
        try {
          await this._checkingSubscribeActual(options.userId);
        } catch (error) {
          if (!(error instanceof ApiError) || error.status !== 400) {
            await this._logger.addLogInLogList(
              {
                idProcess: options.idProcess,
                userId: options.userId,
                addressWallet: wallet.address,
                messageLog: `Oops, problems on server. Actions were not used. We are already working on this.\n`,
              },
              options.idProcess,
              options.userId,
            );
            console.log(error);
          }
          this._problemWallets.push(...walletsList.slice(walletsList.indexOf(wallet)));
          await this._logger.addLogInLogList(
            {
              idProcess: options.idProcess,
              userId: options.userId,
              addressWallet: wallet.address,
              messageLog: `Not enough actions to continue\n`,
            },
            options.idProcess,
            options.userId,
          );
          break;
        }

        await this._checkingEmergencyStopProcess(options.idProcess);

        if (this._isEmergencyStop) {
          // Wright log process
          await this._logger.addLogInLogList(
            {
              idProcess: options.idProcess,
              userId: options.userId,
              addressWallet: wallet.address,
              messageLog: `The process was urgently stopped by the client. For the wallet ${wallet.address} the action was rejected\n`,
            },
            options.idProcess,
            options.userId,
          );
          return;
        }

        const lengthTokenBuy = options.tokenBuy.length;
        const lengthTokenSell = options.tokenSell.length;
        const tokenBuy = options.tokenBuy[lengthTokenBuy > 1 ? Math.floor(Math.random() * lengthTokenBuy) : 0];
        const tokenSell = options.tokenSell[lengthTokenSell > 1 ? Math.floor(Math.random() * lengthTokenSell) : 0];

        // get current course for token

        let course = courses.get(tokenSell);

        if (!course) {
          course = await getCourse(tokenSell);
          courses.set(tokenBuy, course);
        }

        // get num of decimals for token

        const tokenDecimals = numDecimals.get(tokenSell.toUpperCase());
        if (!tokenDecimals) {
          throw new Error(`Token ${tokenSell.toUpperCase()} is not supported\n`);
        }

        const amount = UtilsEcosystem.randomizePriceAndDecimalPlaces(
          minAmount * course,
          maxAmount * course,
          tokenDecimals.min,
          tokenDecimals.max,
        );

        const amountUsd = (+amount / course).toFixed(2);
        await this._logger.addLogInLogList(
          {
            idProcess: options.idProcess,
            userId: options.userId,
            addressWallet: wallet.address,
            tx: null,
            messageLog: `Swap process started from ${tokenSell} to ${tokenBuy} with amount: ${amountUsd}$ on wallet: ${wallet.address}.\n`,
          },
          options.idProcess,
          options.userId,
        );

        // logic started
        const tx = await logic({ wallet, tokenBuy, tokenSell, amount, courseEth, course, networkName });
        
        await this._subscribeActionAdd(wallet.address);
        await this._logger.addLogInLogList(
          {
            idProcess: options.idProcess,
            userId: options.userId,
            addressWallet: wallet.address,
            tx: tx,
            messageLog: `Successfuly swapped, tx: ${tx} \n-------------------------\n`,
            options: 'done',
          },
          options.idProcess,
          options.userId,
        );
        this._successWallet++;
      } catch (error: unknown) {
        const msg = (error as { message: string }).message;
        this._problemWallets.push(wallet);

        await this._logger.addLogInLogList(
          {
            idProcess: options.idProcess,
            userId: options.userId,
            addressWallet: wallet.address,
            messageLog: `Unsuccessful swap. ${msg} \n-------------------------\n`,
            options: 'done',
          },
          options.idProcess,
          options.userId,
        );
      }

      await customDelay(minSecond, maxSecond);
    }

    await this._repository.updateWalletCounts(this._options.idProcess, this._problemWallets.length ?? 0);
    if (this._problemWallets.length) {
      await this._logger.addLogInLogList(
        {
          idProcess: options.idProcess,
          userId: options.userId,
          addressWallet: this._problemWallets.flatMap((wallet) => wallet.address),
          messageLog: `Problematic wallets: ${this._problemWallets
            .flatMap((wallet) => "\n" + wallet.address)} have been identified - Do you want to relaunch them?\n`,
        },
        options.idProcess,
        options.userId,
      );
    } else {
      this._walletList = [];
    }
  }

  /**
   * @description algorithm for executing the bridge process
   * @param {ExecBridgeOptionType} param
   * @returns
   */
  protected async execBridge({ wallets, pathList, options, symbol, customDelay, logic }: ExecBridgeOptionType) {
    await this._loggerStartProcess();

    const { isShuffleWallet } = options;
    const { minSecond, maxSecond } = options.delayAction;
    let { minAmount, maxAmount } = options.delayAmount;
    const walletsList: Wallet[] = isShuffleWallet ? UtilsEcosystem.shuffleWallets(wallets) : wallets;
    let isCompleteOperationWithCurrentPath: boolean | undefined;

    const course = await getCourse(symbol);
    minAmount *= course;
    maxAmount *= course;
    const tokenDecimals = numDecimals.get(symbol.toUpperCase());
    const courseEth = await getCourse('ETH');

    if (!tokenDecimals) {
      await this._logger.addLogInLogList(
        {
          idProcess: options.idProcess,
          userId: options.userId,
          addressWallet: walletsList.map((wallet) => wallet.address),
          messageLog: `Token ${symbol.toUpperCase()} is not supported\n`,
        },
        options.idProcess,
        options.userId,
      );
      return;
    }

    for (const wallet of walletsList) {
      try {
        await this._checkingSubscribeActual(options.userId);
      } catch (error: unknown) {
        if (!(error instanceof ApiError) || error.status !== 400) {
          await this._logger.addLogInLogList(
            {
              idProcess: options.idProcess,
              userId: options.userId,
              addressWallet: wallet.address,
              messageLog: `Oops, problems on server. Actions were not used. We are already working on this.\n`,
            },
            options.idProcess,
            options.userId,
          );
          console.log(error);
        }
        this._problemWallets.push(...walletsList.slice(walletsList.indexOf(wallet)));
        await this._logger.addLogInLogList(
          {
            idProcess: options.idProcess,
            userId: options.userId,
            addressWallet: wallet.address,
            messageLog: `Not enough actions to continue\n`,
          },
          options.idProcess,
          options.userId,
        );
        break;
      }
      await this._checkingEmergencyStopProcess(options.idProcess);

      if (this._isEmergencyStop) {
        // Wright log process
        await this._logger.addLogInLogList(
          {
            idProcess: options.idProcess,
            userId: options.userId,
            addressWallet: wallet.address,
            messageLog: `The process was urgently stopped by the client. For the wallet ${wallet.address} the action was rejected\n`,
          },
          options.idProcess,
          options.userId,
        );
        return;
      }
      isCompleteOperationWithCurrentPath = undefined;
      // Enumeration of departure routes
      for (const path of pathList) {
        const { fromNetwork, toNetwork } = path;
        try {
          if (isCompleteOperationWithCurrentPath && isCompleteOperationWithCurrentPath !== undefined) {
            break;
          }

          const amount = UtilsEcosystem.randomizePriceAndDecimalPlaces(
            minAmount,
            maxAmount,
            symbol === 'USDC' ? 1 : tokenDecimals.min,
            symbol === 'USDC' ? 2 : tokenDecimals.max,
          );
          const amountUsd = (+amount / course).toFixed(2);

          await this._logger.addLogInLogList(
            {
              idProcess: options.idProcess,
              userId: options.userId,
              addressWallet: wallet.address,
              tx: null,
              messageLog: `Bridge process started from ${fromNetwork} to ${toNetwork} using token ${symbol}, amount: ${amountUsd}$ on wallet: ${wallet.address}\n`,
            },
            options.idProcess,
            options.userId,
          );
          await UtilsContracts.connectWalletToProvider(wallet, fromNetwork);

          const tx = await logic({ wallet, symbol, fromNetwork, toNetwork, amount, courses: { courseEth, course } });

          await this._subscribeActionAdd(wallet.address);
          await this._logger.addLogInLogList(
            {
              idProcess: options.idProcess,
              userId: options.userId,
              addressWallet: wallet.address,
              tx: tx,
              messageLog: `Successfuly bridged, tx: ${tx}.\n-------------------------\n`,
              options: 'done',
            },
            options.idProcess,
            options.userId,
          );
          this._successWallet++;
          isCompleteOperationWithCurrentPath = true;
        } catch (error: unknown) {
          const { message } = error as { message: string };
          isCompleteOperationWithCurrentPath = false;

          if (pathList.indexOf(path) === pathList.length - 1) {
            this._problemWallets.push(wallet);
            await this._logger.addLogInLogList(
              {
                idProcess: options.idProcess,
                userId: options.userId,
                addressWallet: wallet.address,
                options: 'done',
                messageLog: `Unsuccessful bridge. ${message}. ${
                  walletsList.indexOf(wallet) !== walletsList.length - 1 ? '\nSwitching to another wallet' : ''
                }\n-------------------------\n`,
              },
              options.idProcess,
              options.userId,
            );
          } else {
            await this._logger.addLogInLogList(
              {
                idProcess: options.idProcess,
                userId: options.userId,
                addressWallet: wallet.address,
                messageLog: `Unsuccessful bridge. ${message}. \nTrying another route.\n`,
              },
              options.idProcess,
              options.userId,
            );
          }
        }
      }

      await customDelay(minSecond, maxSecond);
    }

    await this._repository.updateWalletCounts(options.idProcess, this._problemWallets.length ?? 0);
    if (this._problemWallets.length) {
      await this._logger.addLogInLogList(
        {
          idProcess: options.idProcess,
          userId: options.userId,
          addressWallet: this._problemWallets.flatMap((wallet) => wallet.address),
          messageLog: `Problematic wallets: ${this._problemWallets
            .flatMap((wallet) => "\n" + wallet.address)} have been identified - Do you want to relaunch them?\n`,
        },
        options.idProcess,
        options.userId,
      );
    } else {
      this._walletList = [];
    }
  }

  protected async execCollector({ wallets, options, customDelay, logic }: ExecCollectorOptionType) {
    await this._loggerStartProcess();

    const { isShuffleWallet, tokensToCollect, minCollectValue, collectingToken } = options;
    const { minSecond, maxSecond } = options.delayAction;
    const walletsList: Wallet[] = isShuffleWallet ? UtilsEcosystem.shufflePrivateKeys(wallets) : wallets;
    const problemWallets: Wallet[] = [];
    const courses = new Map<string, number>();
    const networkName: string = Array.isArray(options.fromNetwork) ? options.fromNetwork[0] : options.fromNetwork;
    const courseEth = await getCourse('ETH');
    courses.set('ETH', courseEth);

    let markProblem = false;
    let subscribeIsNotActual = false;
    
    walletsLoop: for (const wallet of walletsList) {
      // execution of swapping all tokens
      markProblem = false;

      for (const token of tokensToCollect) {
        // checking if subscribe is expired
        try {
          const subscribeProblem = await this._checkSubscribeAvailableWithLogging(options);
          if (subscribeProblem) {
            problemWallets.push(...wallets.slice(wallets.indexOf(wallet)));
            subscribeIsNotActual = true;
            break walletsLoop;
          }

          await this._checkingEmergencyStopProcess(options.idProcess);

          if (this._isEmergencyStop) {
            // Wright log process
            await this._logger.addLogInLogList(
              {
                idProcess: options.idProcess,
                userId: options.userId,
                addressWallet: wallet.address,
                messageLog: `The process was urgently stopped by the client. For the wallet ${wallet.address} the action was rejected\n`,
              },
              options.idProcess,
              options.userId,
            );
            return;
          }
          // get num of decimals for token

          let course = courses.get(token);

          if (!course) {
            course = await getCourse(token);
            courses.set(token, course);
          }

          let amount = minCollectValue * course;

          await this._logger.addLogInLogList(
            {
              idProcess: options.idProcess,
              userId: options.userId,
              addressWallet: wallet.address,
              tx: null,
              messageLog: `Collecting process started on wallet: ${wallet.address} using token ${token.toUpperCase()}.\n`,
            },
            options.idProcess,
            options.userId,
          );

          // logic started
          const tx = await logic({
            wallet, 
            tokenToCollect: token, 
            minCollectValue: amount.toString(), 
            collectingToken, 
            networkName, 
            course,
            courseEth,
            swapMethod: UtilsSyncSwap.makeSyncSwap 
          });
          
          await this._subscribeActionAdd(wallet.address);
          await this._logger.addLogInLogList(
            {
              idProcess: options.idProcess,
              userId: options.userId,
              addressWallet: wallet.address,
              tx: tx,
              messageLog: `successfully collected, tx: ${tx} \n-------------------------\n`,
              options: 'done',
            },
            options.idProcess,
            options.userId,
          );
        } catch (error: unknown) {
          const msg = (error as { message: string }).message;
          if (!markProblem) {
            problemWallets.push(wallet);
            markProblem = true;
          }
          if (tokensToCollect.indexOf(token) === tokensToCollect.length - 1) {
            await this._logger.addLogInLogList(
              {
                idProcess: options.idProcess,
                userId: options.userId,
                addressWallet: wallet.address,
                messageLog: `Unsuccessful collecting. ${msg}${walletsList.indexOf(wallet) === walletsList.length - 1 ? '' : '\nSwitching to another wallet'}\n-------------------------\n`,
                options: 'done',
              },
              options.idProcess,
              options.userId,
            );
          } else {
            await this._logger.addLogInLogList(
              {
                idProcess: options.idProcess,
                userId: options.userId,
                addressWallet: wallet.address,
                messageLog: `Unsuccessful collecting. ${msg} \nTrying another token\n`,
                options: 'done',
              },
              options.idProcess,
              options.userId,
            );
          }
        }

        await customDelay(minSecond, maxSecond);
      }
    }
    // transfering eth from all wallets to one given
    if (!subscribeIsNotActual) {
      let problemWalletOnTransfering = await this._execTransfer({wallets: walletsList, options, customDelay});
      
      problemWalletOnTransfering = 
          problemWalletOnTransfering.filter(
            w => !(problemWallets.find(wa => wa.address === w.address))
          );
      problemWallets.push(...problemWalletOnTransfering);
    }
    
    // processing problem wallets
    await this._repository.updateWalletCounts(options.idProcess, problemWallets.length ?? 0);

    if (problemWallets.length) {
      await this._logger.addLogInLogList(
        {
          idProcess: options.idProcess,
          userId: options.userId,
          addressWallet: problemWallets.flatMap((wallet) => wallet.address),
          messageLog: `Problematic wallets: ${problemWallets
            .flatMap((wallet) => wallet.address)
            .toLocaleString()} have been identified - Do you want to relaunch them?\n`,
        },
        options.idProcess,
        options.userId,
      );
      this._walletList = problemWallets;
    } else {
      this._walletList = [];
    }
  }

  
  /**
   * Performs a tranfer from given wallets to an array of collectors wallets.
   * @params wallets, options, customDelay
   * @returns An array of problem wallets
   */
  private async _execTransfer({wallets, options, customDelay}: ExecTransferOptionType): Promise<Wallet[]> {
    const { isShuffleWallet, collectToWallets } = options;
    const { minSecond, maxSecond } = options.delayAction;

    wallets = isShuffleWallet ? UtilsEcosystem.shuffleWallets(wallets) : wallets;

    const problemWallets: Wallet[] = [];

    if (collectToWallets.length == 1) {
      for (const wallet of wallets) {
        const subscribeProblem = await this._checkSubscribeAvailableWithLogging(options);
        if (subscribeProblem) {
          problemWallets.push(...wallets.slice(wallets.indexOf(wallet)));
          break;
        }

        const isProblem = await this._transferToWallet(options, collectToWallets[0], wallet);
        
        if (isProblem) {
          problemWallets.push(wallet);
        }
        
        await customDelay(minSecond, maxSecond);
      }
    } 
    // transfering eth from all wallets to random one from given
    else if (collectToWallets.length > 1) {
      for (const wallet of wallets) {
        const subscribeProblem = await this._checkSubscribeAvailableWithLogging(options);
        if (subscribeProblem) {
          problemWallets.push(...wallets.slice(wallets.indexOf(wallet)));
          break;
        }

        const walletToCollect = UtilsEcosystem.getRandomItemFromArray(collectToWallets);
          
        const isProblem = await this._transferToWallet(options, walletToCollect, wallet);
        
        if (isProblem) {
          problemWallets.push(wallet);
        }

        await customDelay(minSecond, maxSecond);
      }
    }

    return problemWallets;
  }


  /** 
  *  Performs a single transfer from wallet to transferToWallet wallet with logging.
  *  @returns true if transfer was unsuccess else false
  *  
  */
  private async _transferToWallet(options: OptionType, transferToWallet: string, wallet: Wallet): Promise<boolean> {
    const {minPercent, maxPercent} = options;
    let isProblem = false;

    try {
      const percent = +UtilsEcosystem.randomizePriceAndDecimalPlaces(minPercent, maxPercent, 0, 0);
      const tx = await UtilsContracts.transferEthToAddress(wallet, percent, transferToWallet);
      await this._logger.addLogInLogList(
        {
          idProcess: options.idProcess,
          userId: options.userId,
          addressWallet: wallet.address,
          tx: tx,
          messageLog: `Successfully transfered from ${wallet.address} to ${transferToWallet}, tx: ${tx} \n-------------------------\n`,
          options: 'done',
        },
        options.idProcess,
        options.userId,
      );
      await this._subscribeActionAdd(wallet.address);
    } catch (error: unknown) {
      const msg = (error as { message: string }).message;
      isProblem = true;
      
      await this._logger.addLogInLogList(
        {
          idProcess: options.idProcess,
          userId: options.userId,
          addressWallet: wallet.address,
          messageLog: `Unsuccessful transfering. ${msg} \n-------------------------\n`,
          options: 'done',
        },
        options.idProcess,
        options.userId,
      );
    }

    return isProblem;
  }


  /**
   * checking if subscribe is actual with logging
   * @param options 
   * @returns true if subscribe is actual else false
   */
  private async _checkSubscribeAvailableWithLogging(options: OptionType): Promise<boolean> {
    try {
      await this._checkingSubscribeActual(options.userId);
      return false;
    } catch (error) {
      if (!(error instanceof ApiError) || error.status !== 400) {
        await this._logger.addLogInLogList(
          {
            idProcess: options.idProcess,
            userId: options.userId,
            messageLog: `Oops, problems on server. Actions were not used. We are already working on this.\n`,
          },
          options.idProcess,
          options.userId,
        );
        console.log(error);
        return true;
      }
      await this._logger.addLogInLogList(
        {
          idProcess: options.idProcess,
          userId: options.userId,
          messageLog: `Not enough actions to continue\n`,
        },
        options.idProcess,
        options.userId,
      );
      return true;
    }
  }

  /**
   * @description This method builds a workflow of the process for bridges and swaps in any ecosystem.
   * @param {WorkFlowProcessType}
   */
  protected async _workFlowProcess({ wallets, idProcess, userId, processWorker }: WorkFlowProcessType) {
    await this._startProcessFlow(idProcess);

    await processWorker();

    if (this._problemWallets.length && !this._isEmergencyStop) {
      await this._problemProcessFlow({
        idProcess,
        userId,
        wallets: this._problemWallets,
      });
      return;
    }

    await this._endingProcessFlow(idProcess);
  }

  /**
   * @description
   * @param tx
   * @param wallet
   */
  private async _subscribeActionAdd(wallet: string) {
    const subscribeId$ = await lastValueFrom(
      await this._subscribe.getSubscribeIdByName({
        name: this._options.ecoSystem.toLowerCase(),
      }),
    );
    await lastValueFrom(
      await this._subscribe.subscribeAddAction({
        userId: this._options.userId,
        addWalletsInfo: {
          wallet: wallet,
          subscribeId: subscribeId$.id,
        },
      }),
    );
  }

  /**
   * @description Checking if the subscription is up to date for the user.
   */
  private async _checkingSubscribeActual(userId: number) {
    const subscribeId$ = await lastValueFrom(
      await this._subscribe.getSubscribeIdByName({
        name: this._options.ecoSystem.toLowerCase(),
      }),
    );
    const balanceSubscribe$ = await lastValueFrom(
      await this._subscribe.getBalanceOnSubscribe({
        subscribeId: subscribeId$.id,
        userId: userId,
      }),
    );

    if (balanceSubscribe$ && balanceSubscribe$ <= 0) {
      throw ApiError.BadRequest('You need to renew your subscription for subsequent operations!');
    }
  }

  /**
   * @description method executes a procedure for recording the history of the process
   * @param subscribeId - id subscribe
   * @param idProcess - id process
   * 
   * @example 
   *    // code get subscribe id value
   *    const subscribeId$ = await lastValueFrom(
          await this._subscribe.getSubscribeIdByName({
            name: this._options.ecoSystem.toLowerCase(),
          }),
        );
   * @example 
   *    // code get id process value
   *    const { idProcess } = this._options;
   */
  private async _accumulateLogForHistory(subscribeId: number, idProcess: string) {
    const { logs, walletCount, options, problemWalletCount } = await this._repository.getLogsByIdProcess(idProcess);
    const optionsObject = options;
    const modeProcessReturningFields = UtilsBuildObjectForResponse.settingResponseObjectForProcessConfiguration(
      optionsObject ?? this._options,
    );
    const logsForHistory: LoggerType[] = logs.length
      ? logs.flatMap((log) => changeLog(log))
      : this._logger
          .getLogsList(idProcess, optionsObject.userId ?? this._options.userId)
          .flatMap((log) => changeLog(log));
    await lastValueFrom(
      await this._history.historyAddLogs({
        log: {
          ...modeProcessReturningFields,
          processId: idProcess,
          logs: logsForHistory,
          userId: optionsObject.userId,
          subscribeId: subscribeId,
          walletCount,
          problemWalletCount: this._isEmergencyStop
            ? walletCount - this._successWallet
            : problemWalletCount ?? this._problemWallets.length,
          options: optionsObject,
        },
      }),
    );
  }

  /**
   * @description At start the process, record the multiplication_table beginning
   * process in the table for further control of the process.
   * Fixes the status of the process as enabled
   */
  private async _recordingToMonitorExecution() {
    await this._repository.createProcess({
      idProcess: this._options.idProcess,
      userId: this._options.userId,
      status: 'enabled',
      option: this._options,
      ecosystem: this._options.ecoSystem,
      walletCount: this._walletList.length,
    });
  }

  /**
   * @description method send starting log
   */
  private async _loggerStartProcess() {
    const modeProcessReturningFields = UtilsBuildObjectForResponse.settingResponseObjectForProcessConfiguration(
      this._options,
    );

    await this._logger.addLogInLogList(
      {
        ...modeProcessReturningFields,
        idProcess: this._options.idProcess,
        userId: this._options.userId,
        messageLog: 'The process has been started!\n',
      },
      this._options.idProcess,
      this._options.userId,
    );
  }

  /**
   * @description method send ending log with status process
   */
  private async _endingLoggingProcess() {
    const statusProcess = await this._getProcessStatus(this._options.idProcess);
    await this._logger.addLogInLogList(
      {
        idProcess: this._options.idProcess,
        userId: this._options.userId,
        options: 'end',
        messageLog: `The process ended\n`,
      },
      this._options.idProcess,
      this._options.userId,
    );
  }

  /**
   * @description method performs role of intermediate storage of information in db for re-use in the start new process
   * @see /src/multiplication/multiplication.service.ts
   */
  private async _processSaveChangesLogsAndArtifact({
    wallets,
    idProcess,
    userId,
  }: ProcessSaveChangesLogsAndArtifactType) {
    await this._repository.setArtifactProcess(
      idProcess,
      wallets.flatMap((wallet) => wallet.privateKey),
    );
    await this._repository.setLogsByIdProcess(idProcess, this._logger.getLogsList(idProcess, userId));
  }

  /**
   * @description This method builds a workflow of the process for bridges and swaps in any ecosystem.
   * @param {string} idProcess - this identifier is generated in initInstanceSettings method of the MultiplicationService class.
   * @see /src/multiplication/multiplicator.service.ts
   */
  private async _startProcessFlow(idProcess: string) {
    await this._recordingToMonitorExecution();
    await this._enableProcess(idProcess);
  }

  /**
   * @description This method is responsible for the behavior in the situation of problematic processes.
   * @param {ProblemFlowProcessType}
   */
  private async _problemProcessFlow({ wallets, idProcess, userId }: ProblemFlowProcessType) {
    await this._pauseProcess(idProcess);
    await this._endingLoggingProcess();
    await this._processSaveChangesLogsAndArtifact({
      idProcess,
      userId,
      wallets,
    });

    this._problemWallets = [];
  }

  /**
   * @description This method builds a workflow of the process for bridges and swaps in any ecosystem.
   * @param {string} idProcess - this identifier is generated in initInstanceSettings method of the MultiplicationService class.
   * @see /src/multiplication/multiplicator.service.ts
   */
  private async _endingProcessFlow(idProcess: string) {
    const subscribeId$ = await lastValueFrom(
      await this._subscribe.getSubscribeIdByName({
        name: this._options.ecoSystem.toLowerCase(),
      }),
    );
    await this._disableProcess(idProcess);
    await this._endingLoggingProcess();
    await this._accumulateLogForHistory(subscribeId$.id, idProcess);

    this._problemWallets = [];
  }

  private async _checkingEmergencyStopProcess(idProcess: string) {
    const { isEmergencyStop } = await this._repository.getEmergencyStopProcess(idProcess);

    if (!isEmergencyStop) {
      return;
    }

    this._isEmergencyStop = true;
  }
}
