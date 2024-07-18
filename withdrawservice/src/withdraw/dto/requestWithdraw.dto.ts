import { WithdrawConfigDto } from "./withdrawConfig.dto";

export class RequestWithdrawDto {
  wallets: string[];
  config: WithdrawConfigDto;
}