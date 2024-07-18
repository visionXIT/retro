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
}
export type LoggerPaymentType =  {
  payment_id: number;
  invoice_id: number | null;
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


export type PaymentStatusData = {
  payment_id: number;
  invoice_id: number | null;
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


export type JwtPayloadType = {
  userId: number;
  login?: string;
  email?: string;
  role: 'user' | 'manager';
};