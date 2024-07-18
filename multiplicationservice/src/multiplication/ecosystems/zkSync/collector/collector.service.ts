import { Contract } from "ethers";
import { getTokenAddressByNetwork } from "multiplication/utils/utils-config";
import { CollectorParams } from "types/operations.types";
import { erc20Abi } from "./abi/erc20-abi";
import { formatUnits, parseUnits } from "ethers/lib/utils";

export class CollectorService {
  public static async collectAllTokens({
    wallet, 
    minCollectValue, 
    tokenToCollect, 
    collectingToken,
    swapMethod,
    course, 
    courseEth,
    networkName
  }: CollectorParams): Promise<string> {
    const tokenAddress = getTokenAddressByNetwork(networkName, tokenToCollect);
    if (!tokenAddress) {
      throw new Error(`Error by collecting tokens: unsupported token ${tokenToCollect.toUpperCase()}`);
    }
    const tokenContract = new Contract(tokenAddress, erc20Abi, wallet);
    const _decimals = tokenContract.decimals();
    const _balance = tokenContract.balanceOf(wallet.address);
    const [decimals, balance] = await Promise.all([_decimals, _balance]);
    const amountToCollect = parseUnits((+minCollectValue).toFixed(decimals), decimals);
    console.log("collect: ", tokenToCollect, minCollectValue);

    if (amountToCollect.gt(balance)) {
      throw new Error(`Error by collecting tokens: non-compliance with the exchange condition.`);
    }
    const amountToSwap = formatUnits(balance, decimals);

    const tx = await swapMethod({
      wallet, 
      tokenBuy: collectingToken, 
      tokenSell: tokenToCollect, 
      amount: amountToSwap, 
      course, courseEth,
      networkName
    });

    return tx;
  }
}