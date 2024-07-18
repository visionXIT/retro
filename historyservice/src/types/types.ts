import { CreateHistoryDto } from 'history/dto/create-history.dto';
import { Pool } from 'pg';

export type HistoryType = Omit<CreateHistoryDto, 'userId' & 'subscribeId'> & {
  subscribeName: string;
};

export type BriefHistoryType = Omit<HistoryType, 'logs'>;

export interface IHistoryService {
  getHistoryByProcessId: (processId: string) => Promise<HistoryType>;
  getAllUserBriefHistory: (userId: number) => Promise<BriefHistoryType[]>;
  getAllUserHistory: (userId: number) => Promise<HistoryType[]>;
  addHistory: (log: CreateHistoryDto) => Promise<void>;
  deleteHistoryByProcessId: (processId: string) => Promise<void>;
}

export interface IHistoryRepository {
  getHistoryByProcessId: (processId: string) => Promise<HistoryType>;
  getAllUserBriefHistory: (userId: number) => Promise<BriefHistoryType[]>;
  getAllUserHistory: (userId: number) => Promise<HistoryType[]>;
  addHistory: (log: CreateHistoryDto) => Promise<void>;
  deleteHistoryByProcessId: (processId: string) => Promise<void>;
  checkSubscribeId: (subscribeId: number) => Promise<boolean>;
}

export interface IDBConnector {
  db: Pool;
}

export type LoggerType = {
  idProcess?: string;
  userId: number;
  addressWallet?: string | string[];
  tx?: unknown;
  messageLog: string | string[];
  name?: string;
  from?: string | string[];
  to?: string | string[];
  tokens?: string | string[];
  amount?: string | string[];
  options?: OptionType;
};

export type EcoSystemType = 'zkSync' | 'uniswap' | 'pancake' | '1inch' | 'sushiswap';
export type ActionEcoSystemType =
  | 'bridgeOrbiter'
  | 'bridgeZigZag'
  | 'bridgeZkSyncEra'
  | 'syncSwap'
  | 'izumiSwap'
  | 'mute';

export type ProcessInfoType = {
  userId: number;
  ecoSystem: EcoSystemType;
  actionType: ActionEcoSystemType;
};

export type RandomizationType = {
  delayAction: {
    minSecond: number;
    maxSecond: number;
  };
  delayAmount: {
    minAmount: number;
    maxAmount: number;
  };
  delayDecimalPlaces: {
    minDecimalPlaces: number;
    maxDecimalPlaces: number;
  };
  isShuffleWallet: boolean;
};

export type OrbiterFinanceBridgeType = {
  symbol: string | string[];
  fromNetwork: string | string[];
  toNetwork: string | string[];
};

export type SwapOptionType = {
  tokenBuy: string[];
  tokenSell: string[];
};
type OptionsContinueProcess = {
  previosIdProcess?: string;
};

export type OptionType = ProcessInfoType &
  RandomizationType &
  OrbiterFinanceBridgeType &
  SwapOptionType & {
    idProcess: string;
  } & OptionsContinueProcess;
