// logger

import { TransactionReceipt } from "web3";
import { TransactionOrbiterFinance } from "./utils.types";
import { Pool } from "pg";
import { OptionType } from "./multiplication.types";

export type LoggerType = {
  idProcess?: string;
  userId: number;
  addressWallet?: string | string[];
  tx?: TransactionOrbiterFinance | TransactionReceipt;
  messageLog: string | string[];
  name?: string;
  from?: string | string[];
  to?: string | string[];
  tokens?: string | string[];
  amount?: string | string[];
  options?: string;
};

// subscribe
export type AddWalletsType = {
  subscribeId: number;
  wallet: string;
};

export type OnSubscribeType = {
  subscribeId: number;
  numActions: number;
};

export type SubscribeType = {
  id: number;
  name: string;
  actionCost: number;
  state: SubscribeStateType[];
  actionsLimit: number;
  actionsUsed: number;
};

export type SubscribeStateType = {
  actions: number;
  wallet: string;
};

// history

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
  options?: OptionType;
};

// user

export interface IUser {
  id: number;
  address: string;
  role: string;
  refferal_code: string;
  refferal_owner_code: string | null;
}

// db

export interface IDBConnector {
  db: Pool;
}

