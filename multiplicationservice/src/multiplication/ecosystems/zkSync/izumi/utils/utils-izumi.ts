import { SwapParams } from 'types/operations.types';
import { IzumiService } from '../izumi.service';

export class UtilsIzumi {
    public static AddressZero = '0x0000000000000000000000000000000000000000';
    public static DefaultNetworkName = 'zksync';

    public static async makeIzumiSwap({
        wallet, 
        tokenBuy, 
        tokenSell, 
        amount, 
        courseEth, 
        course,
        networkName,
      }: SwapParams): Promise<string> {
        return IzumiService.izumiSwap(wallet, tokenBuy, tokenSell, amount, courseEth, course, networkName);
      }
}