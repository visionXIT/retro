import { Wallet } from "ethers";
import { BridgeParams, NetworkPathes } from "./operations.types";
import { ZkSyncService } from "multiplication/ecosystems/zkSync/zkSync.service";
import { OptionType } from "./multiplication.types";
import { LoggerEvent } from "kafka";
import Web3 from "web3";

// whole multiplicator

export interface IWallet {
  publicKey: string;
  privateKey: string;
}

export type WorkFlowProcessType = {
  idProcess: string;
  userId: number;
  wallets: Wallet[];
  processWorker: () => Promise<void>;
};
export type ProblemFlowProcessType = Omit<WorkFlowProcessType, 'processWorker'>;

export type ProcessSaveChangesLogsAndArtifactType = ProblemFlowProcessType;

// orbiter bridge

export type LogicUseBridgeOrbiterFinance = Pick<BridgeParams, 'wallet'> &
  NetworkPathes & {
    symbol: string;
  };

export type LogicUseBridgeOrbiterFinanceParams = {
  ecoSystem: ZkSyncService;
  wallet: Wallet;
  symbol: string;
  fromNetwork: string;
  toNetwork: string;
  options: OptionType;
  logger: LoggerEvent;
};

export type ActionConfig = OrbiterBridgeConfig;

export type OrbiterBridgeConfig = {
  symbol: string;
  pathList: NetworkPathes[];
};

export type ConfigType = {
  OrbiterAddress: {
    [key: 'eth' | 'usdt' | 'usdc' | string]:
      | string
      | {
          [key: string]: string;
        };
  };
  OrbiterIds: {
    [key: string]: string;
  };
};

export type ReturnSettingBridgeOptionsType = {
  web3: Web3;
  tokenSymbol: string;
  gasPrice: bigint;
  nonce: bigint;
  buyingAmount: string;
};

export type SendEthTokenType = {
  web3: Web3;
  wallet: Wallet;
  token: string;
  amount: string;
  gasPrice: bigint;
  nonce: bigint;
};

export type SendUsdcTokenType = Pick<SendEthTokenType, 'wallet' | 'amount' | 'token'> & {
  toChain: string;
};

export type TransactionOrbiterFinance = unknown | string;


