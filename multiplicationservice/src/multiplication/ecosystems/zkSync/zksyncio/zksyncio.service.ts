import { BigNumber, Contract, Wallet as WalletEthers } from 'ethers';
import { formatEther, parseEther, parseUnits } from "ethers/lib/utils";
import { UtilsContracts } from 'multiplication/utils/utils-contracts';
import { Wallet } from 'zksync-web3';
import { ethTokenAddresses, zksyncTokenAddresses } from "../../../../multiplication/utils/utils-config";
import { erc20Abi } from "./abi/erc20-abi";
import { zksyncBridgeETHAddress } from './utils/config-zksyncio';

export class ZksyncioService {
  public static async bridgeEthToZksync(wallet: Wallet, amountStr: string, token: string, courseEth?: number, course?: number): Promise<string> {
    let amount;
    const tokenAddress = ethTokenAddresses.get(token)!;
    await this._checkSheetFees(wallet._signerL1(), token, +amountStr, courseEth);

    if (token !== 'ETH') {
      const tokenContract = new Contract(tokenAddress, erc20Abi, wallet.providerL1);
      amount = parseUnits(amountStr, await tokenContract.decimals())
      await UtilsContracts.checkBalance(wallet._signerL1(), token, amountStr, course, tokenContract);
      await this._approveToken(tokenContract, wallet._signerL1(), amount);
    } else {
      amount = parseEther(amountStr);
    }

    try {
      const deposit = await wallet.deposit({
        token: tokenAddress,
        amount: amount,
        approveERC20: token === 'ETH' ? false : true
      });
      const tx = await deposit.waitL1Commit();
      return tx.transactionHash;
    } catch (error: unknown) {
      UtilsContracts.processErrorInsufficientFunds(error, +amount / (courseEth ?? 1), "Error by bridging tokens", courseEth);
      return '';
    }
  }

  public static async bridgeZksyncToEth(wallet: Wallet, amountStr: string, token: string, courseEth?: number, course?: number): Promise<string> {
    let amount;
    const tokenAddress = zksyncTokenAddresses.get(token)!;
    
    if (!ethTokenAddresses.get(token)) {
      throw new Error("Unsupported token");
    }

    if (token !== 'ETH') {
      const tokenContract = new Contract(tokenAddress, erc20Abi, wallet.provider);
      amount = parseUnits(amountStr, await tokenContract.decimals());
      await UtilsContracts.checkBalance(wallet, token, amountStr, course, tokenContract);
      await this._approveToken(tokenContract, wallet, amount);
    } else {
      amount = parseEther(amountStr);
      await UtilsContracts.checkBalance(wallet, token, amountStr, course);
    }
    try {
      const withdraw = await wallet.withdraw({
        token: tokenAddress,
        amount: amount
      });
      const tx = await withdraw.wait();
      return tx.transactionHash;
    } catch (error: unknown) {
      UtilsContracts.processErrorInsufficientFunds(error, +amountStr / (courseEth ?? 1), "Error by bridging tokens", courseEth);
      return '';
    }
  }

  private static async _approveToken(tokenSellContract: Contract, wallet: WalletEthers, amount: BigNumber) {
    try {
      await UtilsContracts.approveInfIfLowerThanLimit(
        tokenSellContract, 
        wallet, 
        zksyncBridgeETHAddress, 
        amount
      );
    } catch (error: unknown) {
      const code = (error as {code: string}).code;
      if (code === 'INSUFFICIENT_FUNDS') {
        throw new Error("Error with bridging tokens: insufficient balance for approve");
      }
      throw new Error("Error with bridging tokens: cannot make approve for zksync");
    }
  }

  private static async _checkSheetFees(wallet: WalletEthers, token: string, amount: number, ethCourse?: number) {
    const ethBalance = +formatEther(await wallet.getBalance());
    if (token === 'ETH') {
      if (ethBalance < 0.005 + amount) {
        throw new Error(`Error by bridging tokens: insufficient balance, must have at least ${((0.005 + amount) / (ethCourse ?? 1)).toFixed(2)}$ ETH for bridge`);
      }
    } else {
      if (ethBalance < 0.009) {
        throw new Error(`Error by bridging tokens: insufficient balance, must have at least ${(0.009 / (ethCourse ?? 1)).toFixed(2)}$ ETH for bridge`);
      }
    }
  }
}