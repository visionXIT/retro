import { BigNumber, Contract, Wallet } from 'ethers';

import { defaultAbiCoder, parseUnits} from 'ethers/lib/utils';
import { getJsonRpcProviderByNetworkName, getNetworkName, getTokenAddressByNetwork } from '../../../utils/utils-config';
import { oneInchAggregationRouterV5Abi } from './abi/oneInchAggregationRouterV5-abi';
import { getAggregationRouterAddressByNetwork, tryGetPoolIdForOneInchAggregatedForSpaceFi } from './utils/config-oneInch';
import { UtilsOneInch } from './utils/utils-oneinch';
import { isEth } from './utils/isEth';
import { erc20Abi } from './abi/erc20-abi';
import { UtilsContracts } from 'multiplication/utils/utils-contracts';


export class OneInchService {
  public static async oneInch(
    wallet: Wallet,
    tokenBuy: string,
    tokenSell: string,
    amountStr: string,
    courseEth: number,
    course: number,
    _networkName?: string
  ): Promise<string> {
    if (tokenBuy.toUpperCase() === tokenSell.toUpperCase()) {
      throw new Error('Error with swapping tokens: cannot swap same tokens');
    }



    let chainId;
    try {
      chainId = (await wallet.provider.getNetwork()).chainId;
    } catch (e) {
      chainId = undefined;
    }



    // configure working variables
    const signer = this._getConnectedSigner(wallet, _networkName);
    const networkName = getNetworkName(chainId ? chainId : _networkName ?? UtilsOneInch.DefaultNetworkName);
    const tokenBuyAddress = getTokenAddressByNetwork(networkName, tokenBuy);
    const tokenSellAddress = getTokenAddressByNetwork(networkName, tokenSell);
    const oneInchAggregationRouterAddressV5 = getAggregationRouterAddressByNetwork(networkName);
    const oneInchAggregationRouterV5 = new Contract(oneInchAggregationRouterAddressV5, oneInchAggregationRouterV5Abi, signer);
    const tokenInAddress = isEth(tokenSellAddress) ? UtilsOneInch.AddressZero : tokenSellAddress;
    
    let tx;



    if (!tokenBuyAddress || !tokenSellAddress) {
      throw new Error('Error by swapping tokens: tokens are not supported');
    }



    try {
      // As 1inch aggregation router for SpaceFi needs specific IDs for specific pair
      // We get those IDs and then add in our function 
      const pool = tryGetPoolIdForOneInchAggregatedForSpaceFi(tokenInAddress, tokenBuyAddress);
      
      
      // Here we convert our "Human readable" amount into "raw" value
      // for performing execution in blockchain
      const decimals = isEth(tokenInAddress) ? 18 : await (new Contract(tokenInAddress, erc20Abi, signer)).decimals();
      const amountsIn = BigInt(parseUnits(amountStr, decimals).toString());



      // checking allowance for specific token
      // if allowance less than transfer amount approve for 1inch aggregator
      await UtilsOneInch.checkAllowance(tokenInAddress, signer, oneInchAggregationRouterAddressV5, amountsIn);
  

      tx = await oneInchAggregationRouterV5.unoswap(
          tokenInAddress,
          amountsIn,
          10,
          pool,
          {
              value: isEth(tokenInAddress) ? amountsIn : 0,
          }
      );

      await tx.wait();

    } catch (error) {
      UtilsContracts.processErrorInsufficientFunds(
        error,
        tokenSell === 'ETH' ? +amountStr / courseEth : 0,
        "Error by swapping tokens",
        courseEth
      );
    }


    return tx ? tx.hash : '1INCH_SWAP_TX_FAIL';
  }


  //* @note default network is `zkSync` 
  //* @return instance of wallet connected to specific network
  private static _getConnectedSigner(accountOrPrivateKey: string | Wallet, _networkName?: string) {
    const networkName = getNetworkName(_networkName ?? UtilsOneInch.DefaultNetworkName);
    const provider = getJsonRpcProviderByNetworkName(networkName);
    const privateKey = typeof accountOrPrivateKey === 'string' ? accountOrPrivateKey: accountOrPrivateKey.privateKey;

    return new Wallet(privateKey, provider);
  }
}
