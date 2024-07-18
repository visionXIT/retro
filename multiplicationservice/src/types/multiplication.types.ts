export type ProcessStatus = 'disabled' | 'enabled' | 'pause';

export type NetworkName =
  | 'Ethereum'
  | 'Arbitrum'
  | 'Linea'
  | 'zkSync'
  | 'StarkNet'
  | 'Polygon'
  | 'Optimism'
  | 'ImmutableX'
  | 'Loopring'
  | 'Metis'
  | 'dYdX'
  | 'ZKSpace'
  | 'Boba'
  | 'ZkSync2.0'
  | 'BSC';

export type SwapOptionType = {
  tokenBuy: string[];
  tokenSell: string[];
};

type OptionsContinueProcess = {
  previosIdProcess?: string;
};

export type OrbiterFinanceBridgeType = {
  symbol: string | string[];
  fromNetwork: string | string[];
  toNetwork: string | string[];
};

export type CollectorOptionType = {
  collectToWallets: string[];
  tokensToCollect: string[];
  collectingToken: string;
  minCollectValue: number;
  minPercent: number;
  maxPercent: number;
}

export type OptionType = ProcessInfoType &
  RandomizationType &
  OrbiterFinanceBridgeType &
  SwapOptionType & 
  CollectorOptionType & {
    idProcess: string;
  } & OptionsContinueProcess;

export interface IMultiplicatorService {
  getStatusProcess: (idProcess: string) => Promise<ProcessStatus>;
  startProcess: (wallets: string[], options: OptionType) => Promise<{ idProcess: string; statusProcess: string }>;
  stopProcess: (idProcess: string, userId: number) => Promise<void>;
  pauseProcess: (idProcess: string, userId: number) => Promise<void>;
  continueProcess: (
    idProcess: string,
    userId: number,
    option?: OptionType,
  ) => Promise<{
    idProcess: string;
    statusProcess: string;
  } | void>;
}

export type EcoSystemType = 'zkSync' | 'linea' | 'scroll' | 'uniswap' | 'pancake' | '1inch' | 'sushiswap';
export type ActionEcoSystemType =
  | 'bridgeOrbiter'
  | 'bridgeZigZag'
  | 'bridgeZkSyncEra'
  | 'syncSwap'
  | 'izumiSwap'
  | '1inch'
  | 'mute'
  | 'collector';

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
  isShuffleWallet: boolean;
};
