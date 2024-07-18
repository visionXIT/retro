import { BigNumber, Contract, Wallet, ethers } from 'ethers';
import { parseEther, parseUnits } from 'ethers/lib/utils';
import { getJsonRpcProviderByNetworkName, getTokenAddressByNetwork, zksyncTokenAddresses } from '../../../../multiplication/utils/utils-config';
import { UtilsContracts } from '../../../../multiplication/utils/utils-contracts';
import { erc20Abi } from './abi/erc20-abi';
import { routerAbi } from './abi/router-abi';
import { DEFAULT_NETWORK_NAME, MUTE_ROUTER_ADDRESS, SLIPPAGE_MAX } from './utils/config-mute';

export class MuteService {
  public static async mute(
    wallet: Wallet,
    tokenBuy: string,
    tokenSell: string,
    amountStr: string,
    courseEth: number,
    course: number
  ): Promise<string> {
    if (tokenBuy === tokenSell) {
      throw new Error("Error by swapping tokens: cannot swap same tokens");
    }
    // TODO: сделать через стороннюю функцию, либо приватный/защищённый метод
    // обязательно проверяем есть ли провайдер в кошельке
    // в случае если его нет, подключаемся к нему вручную
    try {
      wallet._checkProvider();
    } catch (e) {
      const jsonRpcProvider = getJsonRpcProviderByNetworkName(DEFAULT_NETWORK_NAME);
      wallet.connect(jsonRpcProvider);
    }    

    const tokenSellAddress = getTokenAddressByNetwork(DEFAULT_NETWORK_NAME, tokenSell);
    const tokenBuyAddress = getTokenAddressByNetwork(DEFAULT_NETWORK_NAME, tokenBuy);

    if (!tokenBuyAddress || !tokenSellAddress) {
      throw new Error("Error by swapping tokens: tokens are not supported");
    }

    // Ставим количество дробной части токена, в зависимости от его адреса
    let swapAmount;
    let tokenSellContract: Contract | null = null;

    if(tokenSell === "ETH") {
      swapAmount = parseEther(amountStr);
      await UtilsContracts.checkBalance(wallet, tokenSell, amountStr, courseEth);
    } else {
      tokenSellContract = new Contract(tokenSellAddress, erc20Abi, wallet);
      swapAmount = parseUnits(amountStr, await tokenSellContract.decimals());
      await UtilsContracts.checkBalance(wallet, tokenSell, amountStr, course, tokenSellContract);
    }

    const router = new Contract(
      MUTE_ROUTER_ADDRESS,
      routerAbi,
      wallet
    );

    const deadline = Math.floor(Date.now() / 1000) + 1200;

    if (tokenSell === 'ETH') {            
      return this._swapEthForToken(tokenBuyAddress, wallet, amountStr, router, deadline, courseEth);
    }

    await UtilsContracts.approveInfIfLowerThanLimit(tokenSellContract!, wallet, router.address, swapAmount);

    if (tokenBuy === 'ETH') {
      return this._swapTokenForEth(tokenSellAddress, wallet, swapAmount, router, deadline, courseEth);
    } 
    return this._swapTokenForToken(tokenSellAddress, tokenBuyAddress, wallet, swapAmount, router, deadline, courseEth);
  }

  private static async _swapTokenForEth(
    tokenSellAddress: string, 
    wallet: Wallet, 
    swapAmount: BigNumber, 
    router: Contract, 
    deadline: number,
    courseEth: number
  ) {    
    try {
      const bestPrice = await this._getMinAmountOut(swapAmount, router, tokenSellAddress, zksyncTokenAddresses.get("WETH")!);
      if (!bestPrice) {
        throw new Error("Error by swapping tokens: cannot estimate best price for swapping");
      }
      const tx = await router.swapExactTokensForETHSupportingFeeOnTransferTokens(
        swapAmount,
        bestPrice.amountOut.div(100).mul(SLIPPAGE_MAX), 
        [tokenSellAddress, zksyncTokenAddresses.get("WETH")],
        wallet.address, 
        deadline,
        [false, false]
      );
      return tx.hash;
    } catch (error: unknown) {
      UtilsContracts.processErrorInsufficientFunds(error, 0, "Error by swapping tokens", courseEth);
    }
  }

  private static async _swapEthForToken(
    tokenBuyAddress: string, 
    wallet: Wallet, 
    amountStr: string, 
    router: Contract, 
    deadline: number,
    courseEth: number
  ) {
    const amount = ethers.utils.parseEther(amountStr);
  
    try {
      const bestPrice = await this._getMinAmountOut(amount, router, zksyncTokenAddresses.get("WETH")!, tokenBuyAddress);
      const tx = await router.swapExactETHForTokensSupportingFeeOnTransferTokens(
        bestPrice.amountOut.div(100).mul(SLIPPAGE_MAX),        
        [zksyncTokenAddresses.get("WETH"), tokenBuyAddress],
        wallet.address, 
        deadline,
        [false, false],
        {
          value: amount,
        }
      );
      return tx.hash;
    } catch (error: unknown) {
      UtilsContracts.processErrorInsufficientFunds(error, +amountStr / courseEth, "Error by swapping tokens", courseEth);
    }
  }
  

  private static async _swapTokenForToken(
    tokenSellAddress: string, 
    tokenBuyAddress: string, 
    wallet: Wallet, 
    swapAmount: BigNumber, 
    router: Contract,
    deadline: number,
    courseEth: number
  ) {
    try {
      const bestPrice = await this._getMinAmountOut(swapAmount, router, tokenSellAddress, tokenBuyAddress);
      if (!bestPrice) {
        throw new Error("Error by swapping tokens: cannot estimate best price for swapping");
      }
      const tx = await router.swapExactTokensForTokensSupportingFeeOnTransferTokens(
        swapAmount,
        bestPrice.amountOut.div(100).mul(SLIPPAGE_MAX), 
        [tokenSellAddress, tokenBuyAddress],
        wallet.address, 
        deadline,
        [false, false],
      );
  
      return tx.hash;
    } catch (error: unknown) {
      UtilsContracts.processErrorInsufficientFunds(error, 0, "Error by swapping tokens", courseEth);
    }
  }

  private static async _getMinAmountOut(
    amount: BigNumber, 
    router: Contract, 
    addr1: string, 
    addr2: string
  ): Promise<{ amountOut: BigNumber; }> {
    try {
      return await router.getAmountOut(
        amount,
        addr1,
        addr2
      );
    } catch(error: unknown) {
      throw new Error("Error by swapping tokens: cannot estimate price for swapping");
    }
  }
}
