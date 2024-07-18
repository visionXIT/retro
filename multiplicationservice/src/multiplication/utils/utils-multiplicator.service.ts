import { Wallet } from 'ethers';
import { UtilsEcosystem } from './utils-ecosystem.service';
import { ZkSyncService } from '../ecosystems/zkSync/zkSync.service';
import { Injectable } from '@nestjs/common';
import { HistoryEvent, LoggerEvent, SubscribeEvent } from 'kafka';
import { MultiplicationRepository } from 'multiplication/multiplication.repository';
import { ApiError } from 'error/api.error';
import { OptionType } from 'types/multiplication.types';
import { NetworkPathes } from 'types/operations.types';

@Injectable()
export class UtilsMultiplicator {
  private _options: OptionType;
  private _zkSyncService: ZkSyncService;
  private _token: string;
  private _pathsListForOperations: NetworkPathes[];

  constructor(
    walletList: Wallet[],
    options: OptionType,
    private _loggerEvent: LoggerEvent,
    private _subscribeEvent: SubscribeEvent,
    private _history: HistoryEvent,
    private _repository: MultiplicationRepository,
  ) {
    // init options
    this._options = options;
    this._pathsListForOperations = [];
    const { symbol, fromNetwork, toNetwork } = this._options;
    // realization random bridge token from tokens list
    this._token = UtilsEcosystem.randomTokenOrNetworkFromListTokensOrNetwork(symbol);
    // realization random routers from list networks
    this._getNetworkListRoutes(fromNetwork, toNetwork);
    // ecosystem instance
    this._zkSyncService = new ZkSyncService(
      walletList,
      this._options,
      this._loggerEvent,
      this._subscribeEvent,
      this._history,
      this._repository,
    );
  }

  /**
   * @description This method helps to manage the processes of the ZkSync ecosystem for
   * organizing calls within the MultiplicatorService
   */
  public async ZkSyncHelper() {
    const { actionType } = this._options as OptionType;

    switch (actionType) {
      case 'bridgeOrbiter':
        await this._zkSyncService.useBridgeOrbiterFinance(this._token);
        break;

      case 'bridgeZigZag':
        throw ApiError.NotFound('Cannot find given action');
        break;

      case 'bridgeZkSyncEra':
        await this._zkSyncService.useZksyncioBridge(this._token);
        break;

      case 'izumiSwap':
        await this._zkSyncService.useIzumiSwap();
        break;

      case '1inch':
        await this._zkSyncService.useOneInchSwap();
        break;

      case 'mute':
        await this._zkSyncService.useMute();
        break;

      case 'syncSwap':
        await this._zkSyncService.useSyncSwap();
        break;
      
      case 'collector':
        await this._zkSyncService.useCollector();
        break;
        
      default:
        throw ApiError.NotFound('Cannot find given action');
    }
  }

  /**
   * Retrieves a list of network routes between specified networks.
   * @param fromNetwork - The starting network(s) for the route. Can be a single network or an array of networks.
   * @param toNetwork - The destination network(s) for the route. Can be a single network or an array of networks.
   * @returns void
   */
  private _getNetworkListRoutes(fromNetwork: string | string[], toNetwork: string | string[]) {
    this._pathsListForOperations = UtilsEcosystem.generateNetworkPathsForOperations(fromNetwork, toNetwork);
  }
}
