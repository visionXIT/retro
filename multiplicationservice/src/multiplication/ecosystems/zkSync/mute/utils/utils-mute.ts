import { SwapParams } from 'types/operations.types';
import { MuteService } from '../mute.service';

export class UtilsMute {
  public static async makeMute({
    wallet, 
    tokenBuy, 
    tokenSell, 
    amount, 
    courseEth, 
    course,
    networkName,
  }: SwapParams): Promise<string> {
    if ((networkName as string).toLowerCase() !== 'zksync') {
      throw new Error("Error by swapping tokens: unsupported network, only zkSync is available");
    }
    return MuteService.mute(wallet, tokenBuy, tokenSell, amount, courseEth, course);
  }
}
