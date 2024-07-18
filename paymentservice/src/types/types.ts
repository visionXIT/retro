import { Pool } from 'pg';

export interface IDBConnector {
  db: Pool;
}

export interface IPaymentService {
  createPaymentInvoice: (userId: number, subscribeId: number, actions: number) => Promise<PaymentData>;
  checkingPaymentStatus: (paymentId: number) => Promise<{ message: string } | string>;
}

export type PaymentType = {
  data: PaymentData;
};


export type PaymentStatuses = 'waiting'
  | 'finished'
  | 'confirming'
  | 'confirmed'
  | 'sending'
  | 'partially_paid'
  | 'failed'
  | 'refunded'
  | 'expired';

export type PaymentDataDB = {
  pay_address: string;
  pay_amount: number;
  pay_currency: string;
}

export type PaymentData = {
  payment_id: string;
  payment_status:
    | 'waiting'
    | 'finished'
    | 'confirming'
    | 'confirmed'
    | 'sending'
    | 'partially_paid'
    | 'failed'
    | 'refunded'
    | 'expired';
  pay_address: string;
  price_amount: 3999.5;
  price_currency: string;
  pay_amount: number;
  pay_currency: string;
  order_id: string;
  order_description: string;
  ipn_callback_url: string;
  created_at: string;
  updated_at: string;
  purchase_id: string;
  amount_received: string | null;
  payin_extra_id: string | null;
  smart_contract: string;
  network: string;
  network_precision: number;
  time_limit: string | null;
  burning_percent: string | null;
  expiration_estimate_date: string;
};

export type PaymentStatusType = {
  data: PaymentStatusData;
};

export type LoggerType = {
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
  options?: OptionType;
  paymentStatus?: PaymentStatusData;
};

export type PaymentStatusData = {
  payment_id: number;
  invoice_id: number | null;
  payment_status: PaymentStatuses;
  pay_address: string;
  payin_extra_id: number | null;
  price_amount: number;
  price_currency: string;
  pay_amount: number;
  actually_paid: number;
  pay_currency: string;
  order_id: number | null;
  order_description: string;
  purchase_id: number;
  outcome_amount: number;
  outcome_currency: string;
  payout_hash: string;
  payin_hash: string;
  created_at: string;
  updated_at: string;
  burning_percent: string;
  type: string;
  payment_extra_ids: number[];
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

export type ProcessInfoType = {
  userId: number;
  ecoSystem: EcoSystemType;
  actionType: ActionEcoSystemType;
};

export type EcoSystemType =
  | 'zkSync'
  | 'uniswap'
  | 'pancake'
  | '1inch'
  | 'sushiswap';
export type ActionEcoSystemType =
  | 'bridgeOrbiter'
  | 'bridgeZigZag'
  | 'bridgeZkSyncEra'
  | 'syncSwap'
  | 'izumiSwap'
  | '1inch'
  | 'mute';


export type JwtPayloadType = {
  userId: number;
  login?: string;
  email?: string;
  role: 'user' | 'manager';
};

export interface IUser {
  id: number;
  role: 'user' | 'manager';
  refferal_code: string;
  refferal_owner_code: string | null;
}

export type RegisterType = {
  [key: string]: string | (string | undefined);
  email?: string;
  login?: string;
  password: string;
};

export type AuthByRefreshTokenType = Pick<IUser, 'id'> & Pick<RegisterType, 'email'>;


export type PaymentUpdateType = {
  tableId: number,
  actions: number,
  oldActionsLimit: number,
  actionsUsed: number,
}


export enum SubscribeId {
  ETHEREUM = 1,
  SCROLL = 7,
  LINEA_AGE = 8,
  ZK_SYNC = 9,
}
