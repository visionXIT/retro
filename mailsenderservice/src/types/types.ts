import { Pool } from 'pg';

export interface IDBConnector {
  db: Pool;
}

export type MessageType = 'register' | 'update-password' | 'replace-password' | 'update-login' | 'update-email';

export type SendMessageParamsType = {
  email: string | string[];
  subject: string;
  text: string;
  typeMessage: MessageType;
};

export interface IPaymentService {
  createPaymentInvoice: (userId: number, subscribeId: number, actions: number) => Promise<PaymentData>;
  checkingPaymentStatus: (paymentId: number) => Promise<{ message: string } | string>;
}

export type PaymentType = {
  data: PaymentData;
};

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
