import { Wallet } from "ethers";
import { OptionType } from "./multiplication.types";


export type ExecTransferOptionType = {
  wallets: Wallet[];
  options: OptionType;
  customDelay: (min: number, max: number) => Promise<void>;
}

export type ExecCollectorOptionType = {
  wallets: Wallet[];
  options: OptionType;
  logic: (params: CollectorParams) => Promise<string>;
  customDelay: (min: number, max: number) => Promise<void>;
}

export type CollectorParams = {
  wallet: Wallet;
  minCollectValue: string;
  tokenToCollect: string;
  collectingToken: string;
  networkName: string;
  course: number;
  courseEth: number;
  swapMethod: (params: SwapParams) => Promise<string>;
}

export type ExecSwapOptionType = {
  wallets: Wallet[];
  options: OptionType;
  customDelay: (min: number, max: number) => Promise<void>;
  logic: (params: SwapParams) => Promise<string>;
};

export type SwapParams = {
  wallet: Wallet;
  tokenBuy: string;
  tokenSell: string;
  amount: string;
  courseEth: number;
  course: number;
  networkName?: string;
}

export type ExecBridgeOptionType = {
  wallets: Wallet[];
  pathList: NetworkPathes[];
  options: OptionType;
  symbol: string;
  logic: (params: BridgeParams) => Promise<unknown>;
  customDelay: (min: number, max: number) => Promise<void>;
};

export type BridgeParams = {
  wallet: Wallet;
  fromNetwork: string;
  toNetwork: string;
  symbol: string;
  amount: string;
  courses?: Courses
};

export type Courses = {
  courseEth: number;
  course: number;
}

export type NetworkPathes = {
  fromNetwork: string;
  toNetwork: string;
};