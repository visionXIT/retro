import { BigNumber, Contract, Wallet } from 'ethers';

import { defaultAbiCoder, parseEther, parseUnits } from 'ethers/lib/utils';
import { getJsonRpcProviderByNetworkName, getNetworkName, getTokenAddressByNetwork } from '../../../../multiplication/utils/utils-config';
import { UtilsContracts } from '../../../../multiplication/utils/utils-contracts';
import { erc20Abi } from './abi/erc20-abi';
import { syncSwapClassicPoolFactoryAbi } from './abi/syncSwapClassicPoolFactory-abi';
import { syncSwapRouterAbi } from './abi/syncSwapRouter-abi';
import { getSyncSwapAddressesByNetwork } from './utils/config-syncswap';
import { UtilsSyncSwap } from './utils/utils-syncswap';

export class SyncSwapService {
  public static async syncSwap(
    wallet: Wallet,
    tokenBuy: string,
    tokenSell: string,
    amountStr: string,
    courseEth: number,
    course: number,
    networkName?: string
  ): Promise<string> {
    if (tokenBuy.toUpperCase() === tokenSell.toUpperCase()) {
      throw new Error('Error with swapping tokens: cannot swap same tokens');
    }

    const useWethAsEth = true;

    // Получаем сеть 
    this._connectWallet2ProviderIfNotConnected(wallet, UtilsSyncSwap.DefaultNetworkName);

    let chainId;
    try {
      chainId = (await wallet.provider.getNetwork()).chainId;
    } catch (e) {
      chainId = undefined;
    }

    // выбираем сеть из возможных
    // в случае, если ни одна из сетей не указана, то по умолчанию берётся zksync
    // TODO: нужно будет сделать выборку из сетей по умолчанию для определённых экосистем
    const networkId = getNetworkName(chainId ? chainId : networkName ?? UtilsSyncSwap.DefaultNetworkName);

    
    const tokenBuyAddress = getTokenAddressByNetwork(networkId, tokenBuy, useWethAsEth);
    const tokenSellAddress = getTokenAddressByNetwork(networkId, tokenSell, useWethAsEth);


    if (!tokenBuyAddress || !tokenSellAddress) {
      throw new Error('Error by swapping tokens: tokens are not supported');
    }

    const SYNC_SWAP_ROUTER_ADDRESS = getSyncSwapAddressesByNetwork(networkId, 'SyncSwapRouter');
    const SYNC_SWAP_POOOL_FACTORY_ADDRESS = getSyncSwapAddressesByNetwork(networkId, 'SyncSwapClassicPoolFactory');

    // Ставим количество дробной части токена, в зависимости от его адреса
    let swapAmount;

    if(tokenSell === "ETH") {
      swapAmount = parseEther(amountStr);
      await UtilsContracts.checkBalance(wallet, tokenSell, amountStr, courseEth, undefined, useWethAsEth);
    } else {
      const tokenSellContract = new Contract(tokenSellAddress, erc20Abi, wallet);
      swapAmount = parseUnits(amountStr, await tokenSellContract.decimals());
      await UtilsContracts.checkBalance(wallet, tokenSell, amountStr, course, tokenSellContract, useWethAsEth);
      try {
        await UtilsContracts.approveInfIfLowerThanLimit(
          tokenSellContract,
          wallet,
          SYNC_SWAP_ROUTER_ADDRESS,
          swapAmount,
        );
      } catch (error: unknown) {
        throw new Error(`Error by swapping tokens. Cannot approve tokens( ${error} )`);
      }
    }

    const classicPoolFactory = new Contract(
      SYNC_SWAP_POOOL_FACTORY_ADDRESS,
      syncSwapClassicPoolFactoryAbi,
      wallet,
    );

    let poolAddress;
    try {
      poolAddress = await classicPoolFactory.getPool(tokenSellAddress, tokenBuyAddress);
    } catch (error: unknown) {
      throw new Error('Error with swapping tokens: given swap pair is not available at SyncSwap now');
    }

    if (poolAddress === UtilsSyncSwap.AddressZero) {
      throw new Error('Error with swapping tokens: given swap pair is not available at SyncSwap now');
    }

    tokenSell = useWethAsEth && tokenSell === "WETH" ? "ETH" : tokenSell;
    const paths = this._createSwapPath(tokenSellAddress, wallet.address, poolAddress, tokenSell, swapAmount);
    const deadline = BigNumber.from(Math.floor(Date.now() / 1000)).add(1800);
    const router = new Contract(SYNC_SWAP_ROUTER_ADDRESS, syncSwapRouterAbi, wallet);

    
    try {
      const res = await router.swap(paths, 0, deadline, {
        value: tokenSell === 'ETH' ? swapAmount : 0,
      });

      const tx = await res.wait();
      return tx.transactionHash;
    } catch (error: unknown) {
      UtilsContracts.processErrorInsufficientFunds(error, tokenSell === 'ETH' ? +amountStr / courseEth : 0, "Error by swapping tokens", courseEth);
    }

    return '';
  }

  private static _createSwapPath(
    tokenSellAddress: string,
    walletAddress: string,
    poolAddress: string,
    tokenSell: string,
    amount: BigNumber,
  ) {
    const isNativeEthToken = tokenSell === 'ETH' || tokenSell === 'WETH';

    const swapData: string = defaultAbiCoder.encode(
      ['address', 'address', 'uint8'],
      [tokenSellAddress, walletAddress, 1], // address of sell token, address of receiver, withdraw mode 1 or 2 to withdraw to user's wallet
    );

    const steps = [
      {
        pool: poolAddress,
        data: swapData,
        callback: UtilsSyncSwap.AddressZero,
        callbackData: '0x',
      },
    ];

    const paths = [
      {
        steps: steps,
        tokenIn: isNativeEthToken ? UtilsSyncSwap.AddressZero : tokenSellAddress,
        amountIn: amount,
      },
    ];

    return paths;
  }



  private static _connectWallet2ProviderIfNotConnected(account: Wallet, networkName?: string) {
    const networkNameToLower = networkName?.toLowerCase();

    try {
      account._checkProvider();
    } catch (e) {
      const jsonRpcProvider = getJsonRpcProviderByNetworkName(
        networkNameToLower ?
        networkNameToLower :
        UtilsSyncSwap.DefaultNetworkName
      );

      account.connect(jsonRpcProvider);
    }
  }
}
