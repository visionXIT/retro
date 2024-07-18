import { Injectable } from '@nestjs/common';
import { ApiError } from 'error/api.error';
import { Wallet } from 'ethers';
import { HistoryEvent, LoggerEvent, SubscribeEvent } from 'kafka';
import { OptionType, ProcessStatus } from 'types/multiplication.types';
import { UtilsEcosystem } from '../../utils/utils-ecosystem.service';
import { AbstractEcosystemClass } from '../AbstractEcosystemClass';
import { UtilsMute } from './mute/utils/utils-mute';
import { UtilsOrbiterFinance } from './orbiter-finance/utils/orbiter.utils';
import { UtilsSyncSwap } from './syncswap/utils/utils-syncswap';
import { UtilsZksyncio } from './zksyncio/utils/utils-zksyncio';
import { MultiplicationRepository } from 'multiplication/multiplication.repository';
import { UtilsIzumi } from './izumi/utils/utils-izumi';
import { UtilsOneInch } from './one-inch/utils/utils-oneinch';
import { UtilsCollector } from './collector/utils/collector.utils';

@Injectable()
export class ZkSyncService extends AbstractEcosystemClass {
  constructor(
    wallets: Wallet[],
    options: OptionType,
    loggerEvent: LoggerEvent,
    subscribeEvent: SubscribeEvent,
    historyEvent: HistoryEvent,
    repository: MultiplicationRepository,
  ) {
    super('disabled', wallets, options, historyEvent, loggerEvent, subscribeEvent, repository);
  }

  public async disableProcess(idProcess: string): Promise<void> {
    this._disableProcess(idProcess);
  }

  public async pauseProcess(idProcess: string): Promise<void> {
    this._pauseProcess(idProcess);
  }

  public async getProcessStatus(idProcess: string): Promise<ProcessStatus> {
    return await this._getProcessStatus(idProcess);
  }

  public async useMute() {
    await this._workFlowProcess({
      idProcess: this._options.idProcess,
      userId: this._options.userId,
      wallets: this._walletList,
      processWorker: async () =>
        await this.execSwaps({
          wallets: this._walletList,
          options: this._options,
          customDelay: UtilsEcosystem.delay,
          logic: UtilsMute.makeMute,
        }),
    });
  }

  public async useZksyncioBridge(symbol: string) {
    try {
      const pathList = [{ fromNetwork: this._options.fromNetwork[0], toNetwork: this._options.toNetwork[0] }];
      await this._workFlowProcess({
        idProcess: this._options.idProcess,
        userId: this._options.userId,
        wallets: this._walletList,
        processWorker: async () =>
          await this.execBridge({
            wallets: this._walletList,
            pathList,
            options: this._options,
            symbol: symbol,
            logic: UtilsZksyncio.makeZksyncioBridge,
            customDelay: UtilsEcosystem.delay,
          }),
      });
    } catch (error: unknown) {
      const { message } = error as { message: string };
      throw ApiError.BadRequest(message);
    }
  }

  public async useSyncSwap() {
    await this._workFlowProcess({
      idProcess: this._options.idProcess,
      userId: this._options.userId,
      wallets: this._walletList,
      processWorker: async () =>
        await this.execSwaps({
          wallets: this._walletList,
          options: this._options,
          customDelay: UtilsEcosystem.delay,
          logic: UtilsSyncSwap.makeSyncSwap,
        }),
    });
  }

  public async useIzumiSwap() {
    await this._workFlowProcess({
      idProcess: this._options.idProcess,
      userId: this._options.userId,
      wallets: this._walletList,
      processWorker: async () =>
        await this.execSwaps({
          wallets: this._walletList,
          options: this._options,
          customDelay: UtilsEcosystem.delay,
          logic: UtilsIzumi.makeIzumiSwap
        })
    })
  }


  public async useOneInchSwap() {
    await this._workFlowProcess({
      idProcess: this._options.idProcess,
      userId: this._options.userId,
      wallets: this._walletList,
      processWorker: async () =>
        await this.execSwaps({
          wallets: this._walletList,
          options: this._options,
          customDelay: UtilsEcosystem.delay,
          logic: UtilsOneInch.makeOneInchSwap
        })
    });
  }

  public async useBridgeOrbiterFinance(symbol: string) {
    const paths = UtilsEcosystem.generateNetworkPathsForOperations(this._options.fromNetwork, this._options.toNetwork);
    await this._workFlowProcess({
      idProcess: this._options.idProcess,
      userId: this._options.userId,
      wallets: this._walletList,
      processWorker: async () =>
        await this.execBridge({
          wallets: this._walletList,
          pathList: paths,
          options: this._options,
          symbol,
          logic: UtilsOrbiterFinance.makeOrbiterFinanceBridge,
          customDelay: UtilsEcosystem.delay,
        }),
    });
  }

  public async useCollector() {
    await this._workFlowProcess({
      idProcess: this._options.idProcess,
      userId: this._options.userId,
      wallets: this._walletList,
      processWorker: async () =>
        await this.execCollector({
          wallets: this._walletList,
          options: this._options,
          logic: UtilsCollector.makeCollection,
          customDelay: UtilsEcosystem.delay
        })
    });
  }
}
