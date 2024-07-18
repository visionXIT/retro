import { SwapParams } from 'types/operations.types';
import { SyncSwapService } from '../syncswap.service';

export class UtilsSyncSwap {
  public static AddressZero = '0x0000000000000000000000000000000000000000';
  public static DefaultNetworkName = 'zksync';

  public static async makeSyncSwap({
    wallet, 
    tokenBuy, 
    tokenSell, 
    amount, 
    courseEth, 
    course,
    networkName,
  }: SwapParams): Promise<string> {
    return SyncSwapService.syncSwap(wallet, tokenBuy, tokenSell, amount, courseEth, course, networkName);
  }
}
