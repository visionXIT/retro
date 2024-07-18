import { LoggerType, OptionType } from 'types/types';

export class CreateHistoryDto {
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
}
