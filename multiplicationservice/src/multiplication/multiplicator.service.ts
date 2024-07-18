import { Injectable } from '@nestjs/common';
import { ApiError } from 'error/api.error';
import { Wallet, ethers } from 'ethers';
import { HistoryEvent, LoggerEvent, SubscribeEvent } from 'kafka';
import { lastValueFrom } from 'rxjs';
import { EcoSystemType, IMultiplicatorService, OptionType, ProcessStatus } from 'types/multiplication.types';
import { ZkSyncService } from './ecosystems/zkSync/zkSync.service';
import { MultiplicationRepository } from './multiplication.repository';
import { rpcNode } from './utils/utils-config';
import { UtilsMultiplicator } from './utils/utils-multiplicator.service';
import { UtilsBuildObjectForResponse } from './utils/utils-object-process-builder';
import { LoggerType } from 'types/services.types';
import { changeLog } from 'utils/addresses';
import { customAlphabet, nanoid } from 'nanoid';

@Injectable()
export class MultiplicatorService implements IMultiplicatorService {
  public idProcess: string;
  public userId: number;
  public statusProcess: ProcessStatus = 'disabled';
  public ecoSystem: EcoSystemType;

  private _walletList: Wallet[];
  private _options: OptionType;
  private _multiplicatorHelper: UtilsMultiplicator;
  private _zkSyncService: ZkSyncService;

  constructor(
    private _logger: LoggerEvent,
    private _subscribeEvent: SubscribeEvent,
    private _history: HistoryEvent,
    private _repository: MultiplicationRepository,
  ) {}

  public async getStatusProcess(idProcess: string): Promise<ProcessStatus> {
    switch (this.ecoSystem) {
      case 'zkSync':
        this.statusProcess = await this._zkSyncService.getProcessStatus(idProcess);
        break;
      case 'linea':
        this.statusProcess = await this._zkSyncService.getProcessStatus(idProcess);
        break;
      case 'scroll':
        this.statusProcess = await this._zkSyncService.getProcessStatus(idProcess);
        break;
      // For example continue code
      case 'uniswap':
        break;
      default:
        throw ApiError.NotFound(`EcoSystem ${this.ecoSystem} is not defined`);
    }
    return this.statusProcess;
  }

  public async startProcess(
    wallets: string[],
    options: OptionType,
    idProcessContinue?: string,
  ): Promise<{ idProcess: string; statusProcess: string }> {
    if (!(await this._repository.checkUserId(options.userId))) {
      throw ApiError.BadRequest('User is not found');
    }
    this.initInstanceSettings(wallets, options, idProcessContinue);

    switch (this.ecoSystem) {
      case 'zkSync':
        await this._multiplicatorHelper.ZkSyncHelper();
        break;
      case 'linea':
        await this._multiplicatorHelper.ZkSyncHelper();
        break;
      case 'scroll':
        await this._multiplicatorHelper.ZkSyncHelper();
        break;
      // For example continue code
      case 'uniswap':
        break;
      default:
        throw ApiError.NotFound(`EcoSystem ${this.ecoSystem} is not defined`);
    }
    this._logger.removeLogList(this.idProcess);

    return {
      idProcess: this.idProcess,
      statusProcess: this.statusProcess,
    };
  }

  public async stopProcess(idProcess: string, userId: number): Promise<void> {
    if (!(await this._repository.checkProcessId(idProcess))) {
      throw ApiError.NotFound('Your process not found');
    }
    await this._checkProcessOwner(idProcess, userId);
    const process = await this._repository.getProcessById(idProcess);

    this._zkSyncService = new ZkSyncService(
      this._walletList,
      process.options,
      this._logger,
      this._subscribeEvent,
      this._history,
      this._repository,
    );


    switch (process.options.ecoSystem) {
      case 'zkSync':
        await this._repository.setArtifactProcess(idProcess, []);
        await this._zkSyncService.disableProcess(idProcess);
        this._logger.removeLogList(idProcess);

        this.statusProcess = await this._zkSyncService.getProcessStatus(idProcess);
        break;
        
      case 'scroll':
        await this._repository.setArtifactProcess(idProcess, []);
        await this._zkSyncService.disableProcess(idProcess);
        this._logger.removeLogList(idProcess);

        this.statusProcess = await this._zkSyncService.getProcessStatus(idProcess);
        break;

      case 'linea':
        await this._repository.setArtifactProcess(idProcess, []);
        await this._zkSyncService.disableProcess(idProcess);
        this._logger.removeLogList(idProcess);

        this.statusProcess = await this._zkSyncService.getProcessStatus(idProcess);
        break;
      // For example continue code
      case 'uniswap':
        break;
      default:
        throw ApiError.NotFound(`EcoSystem ${this.ecoSystem} is not defined`);
    }
  }

  public async emergencyStop(idProcess: string, userId: number): Promise<void> {
    if (!(await this._repository.checkProcessId(idProcess))) {
      throw ApiError.NotFound('Your process not found');
    }
    await this._checkProcessOwner(idProcess, userId);

    const process = await this._repository.getProcessById(idProcess);
    const statusProcess = await this._repository.checkingStatusProcess(idProcess, process.options.userId);

    if (statusProcess !== 'enabled') {
      await this.stopProcess(idProcess, userId);
      return;
    }

    this._zkSyncService = new ZkSyncService(
      this._walletList,
      process.options,
      this._logger,
      this._subscribeEvent,
      this._history,
      this._repository,
    );

    await this._repository.setArtifactProcess(idProcess, []);
    await this._repository.enabledEmergencyStopProcess(idProcess);
  }

  public async pauseProcess(idProcess: string, userId: number): Promise<void> {
    if (!(await this._repository.checkProcessId(idProcess))) {
      throw ApiError.NotFound('Your process not found');
    }
    await this._checkProcessOwner(idProcess, userId);

    await this._repository.updateStatusProcess(idProcess, 'pause');
    this.statusProcess = await this._zkSyncService.getProcessStatus(idProcess);
  }

  public async continueProcess(
    idProcess: string,
    userId: number,
    options?: OptionType | undefined,
  ): Promise<{
    idProcess: string;
    statusProcess: string;
  } | void> {
    if (!(await this._repository.checkProcessId(idProcess))) {
      throw ApiError.NotFound('Your process not found');
    }
    await this._checkProcessOwner(idProcess, userId);
    if (options && !(await this._repository.checkUserId(options.userId))) {
      throw ApiError.BadRequest('User is not found');
    }

    const { artifact, oldOptions } = await this._repository.getProcessPauseById(idProcess);
    const optionsContinue = options ?? oldOptions;

    if (!artifact) {
      return;
    }
    

    switch (optionsContinue.ecoSystem) {
      case 'zkSync':
        this.startProcess(artifact, optionsContinue, idProcess);
        this.statusProcess = await this._zkSyncService.getProcessStatus(idProcess);
        break;
      // For example continue code
      case 'scroll':
        this.startProcess(artifact, optionsContinue, idProcess);
        this.statusProcess = await this._zkSyncService.getProcessStatus(idProcess);
        break;
      // For example continue code
      case 'linea':
        this.startProcess(artifact, optionsContinue, idProcess);
        this.statusProcess = await this._zkSyncService.getProcessStatus(idProcess);
        break;
      // For example continue code
      case 'uniswap':
        break;
      default:
        throw ApiError.NotFound(`EcoSystem ${this.ecoSystem} is not defined`);
    }

    const modeProcessReturningFields =
      UtilsBuildObjectForResponse.settingResponseObjectForProcessConfiguration(oldOptions ?? optionsContinue);

    const { walletCount, logs, problemWalletCount } = await this._repository.getLogsByIdProcess(idProcess);
    const subscribeId$ = await lastValueFrom(
      await this._subscribeEvent.getSubscribeIdByName({
        name: this._options.ecoSystem.toLowerCase(),
      }),
    );
    
    const logsForHistory: LoggerType[] = logs?.length ? logs.flatMap((log) => changeLog(log)) : [];

    await this._repository.updateStatusProcess(idProcess, 'disabled');
    await lastValueFrom(
      await this._history.historyAddLogs({
        log: {
          ...modeProcessReturningFields,
          processId: idProcess ?? '',
          logs: [...logsForHistory],
          userId: optionsContinue.userId,
          subscribeId: subscribeId$.id,
          walletCount,
          problemWalletCount,
          options: oldOptions ?? optionsContinue,
        },
      }),
    );
    await this._repository.setArtifactProcess(idProcess, []);
  }

  private initInstanceSettings(walletList: string[], options: OptionType, idProcessContinue?: string) {
    // const walletListDecrypt = this._decryptoData(walletList);
    // create id process
    this.idProcess = this._getGenerateId();
    this._options = {
      ...options,
      idProcess: this.idProcess,
      previosIdProcess: idProcessContinue ?? undefined,
    };
    this.ecoSystem = this._options.ecoSystem;
    this.userId = this._options.userId;
    const nodes = this._options.fromNetwork;

    // create wallet list connected to first provider from list
    const provider = new ethers.providers.JsonRpcProvider(rpcNode[nodes[0]?.toLowerCase()]);
    this._walletList = walletList.flatMap((wallet) => new Wallet(wallet ?? '', provider));

    this._multiplicatorHelper = new UtilsMultiplicator(
      this._walletList,
      this._options,
      this._logger,
      this._subscribeEvent,
      this._history,
      this._repository,
    );
    // init ecosystems instances
    this._zkSyncService = new ZkSyncService(
      this._walletList,
      this._options,
      this._logger,
      this._subscribeEvent,
      this._history,
      this._repository,
    );
  }

  /**
   * @description This method generates a process id to index an instance of the multiplier
   * @param length - length id. Default value = 45
   * @returns {string} string as id
   */
  private _getGenerateId(length = 45): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const nanoid = customAlphabet(chars, length);
    return nanoid();
  }

  private async _checkProcessOwner(processId: string, userId: number) {
    
    const _userId = await this._repository.getUserByProcessId(processId);

    if (userId !== _userId) {
      throw ApiError.NotFound('Cannot find your process');
    }
  }
}
