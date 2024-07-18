import { Pool } from 'pg';

export type ProblemWalletType = {
  wallet: string;
  msg: string;
};

export type OkxTokenType = {
  ccy: string;
  logo: string;
  networks: OkxNetworkType[];
};

export type OkxNetworkType = {
  name: string;
  minFee: number;
  maxFee: number;
};

export type OkxWithdrawConfigType = {
  fee: number;
  ccy: string;
  chain: string;
  secretKey: string;
  apiKey: string;
  passphrase: string;
};

export type RandomizationType = {
  minWithdrawal: string;
  maxWithdrawal: string;
  minDelay: string;
  maxDelay: string;

  isShuffleWallets: boolean;
};

export type WithdrawConfigType = OkxWithdrawConfigType & RandomizationType;

export interface IExchanger {
  withdraw: (destinationWallet: string, config: WithdrawConfigType, amt: string) => Promise<void>;
  getCurrencies: () => Promise<OkxTokenType[]>;
}

export interface IWithdrawService {
  withdrawFromOkx: (wallets: string[], settings: WithdrawConfigType) => Promise<ProblemWalletType[]>;
  getOkxTokensAndNetworks: () => Promise<OkxTokenType[]>;
}

export type ReqUserType = {
  email: string;
  userId: number;
};

export type LoggerType = {
  userId: number;
  idProcess: string;
  addressWallet?: string | string[];
  options?: string;
  messageLog: string | string[];
};

export interface IDBConnector {
  db: Pool;
}

export type HistoryCreateType = {
  processId: string;
  logs: LoggerType[];
  userId: number;
  subscribeId: number;
  nameProcess?: string;
  from?: string | string[];
  to?: string | string[];
  tokens?: string | string[];
  amount?: string | string[];
  walletCount?: number;
  problemWalletCount?: number;
  options: any;
};
