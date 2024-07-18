import { WithdrawConfigDto } from "./withdrawConfig.dto";

export class RestartWithdrawDto {
  processId: string;
  config?: WithdrawConfigDto;
}