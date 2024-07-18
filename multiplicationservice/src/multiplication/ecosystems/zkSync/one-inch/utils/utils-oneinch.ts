import { SwapParams } from 'types/operations.types';
import { OneInchService } from '../oneInch.service';
import { Contract, Wallet, constants } from 'ethers';
import { isEth } from './isEth';
import { erc20Abi } from '../abi/erc20-abi';

export class UtilsOneInch {
  public static AddressZero = '0x0000000000000000000000000000000000000000';
  public static DefaultNetworkName = 'zksync';

  public static async makeOneInchSwap({
    wallet, 
    tokenBuy, 
    tokenSell, 
    amount, 
    courseEth, 
    course,
    networkName,
  }: SwapParams): Promise<string> {
    return OneInchService.oneInch(wallet, tokenBuy, tokenSell, amount, courseEth, course, networkName);
  }


  public static async checkAllowance(tokenAddress: string, tokenOwner: Wallet, tokenSpender: string, spendAmount: bigint): Promise<bigint> {
    if(isEth(tokenAddress)){
        return 0n;
    }

    const tokenContract = new Contract(tokenAddress, erc20Abi, tokenOwner);
    let allowance = await tokenContract.allowance(tokenOwner.address, tokenSpender);

    if(allowance < spendAmount) {
        try {
            const tx = await tokenContract.approve(tokenSpender, constants.MaxUint256);
            await tx.wait();
        } catch (e) {
            console.log(e);
        } finally {
            allowance = await tokenContract.allowance(tokenOwner.address, tokenSpender);
        }
    }

    return allowance;
}
}
