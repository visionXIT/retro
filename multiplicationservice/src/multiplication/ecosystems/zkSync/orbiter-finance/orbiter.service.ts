import { rpcNode } from 'multiplication/utils/utils-config';
import { BridgeParams } from 'types/operations.types';
import { ReturnSettingBridgeOptionsType, SendEthTokenType } from 'types/utils.types';
import { Web3 } from 'web3';
import { configOrbiter as config } from './utils/config.orbiter';

export class BridgeOrbiterService {
  public static async sendViaBridge({ wallet, symbol, fromNetwork, toNetwork, amount }: BridgeParams) {
    if (
      (Number(amount) < 0.005 && symbol === 'ETH') ||
      (Number(amount) < 0.005 && symbol === 'WETH') ||
      (Number(amount) < 0.01 && symbol === 'USDC')
    ) {
      throw new Error(
        `Error in orbiter.finance : ${symbol} amount must be not smaller than ${
          symbol === 'ETH' ? 0.005 : symbol === 'WETH' ? 0.005 : symbol === 'USDC' ? 15 : 0
        }`,
      );
    }

    const { web3, tokenSymbol, gasPrice, nonce, buyingAmount } = await this._settingBridgeOptions({
      symbol,
      wallet,
      fromNetwork,
      toNetwork,
      amount: String(amount),
    });

    const bridgeParams = {
      web3,
      nonce,
      wallet,
      gasPrice,
      token: tokenSymbol,
      amount: buyingAmount,
    };

    try {
      let tx;

      if (symbol === 'ETH') {
        tx = await this._sendEthToken(bridgeParams);
      } else {
        throw new Error(`Error by bridging tokens: ${symbol} is not supported`)
      }

      // if (token === 'USDC') {
      //   tx = await this._sendUsdcToken({
      //     toChain,
      //     wallet,
      //     token,
      //     amount: buyingAmount,
      //   });
      // }
      return tx;
    } catch (error: unknown) {
      throw new Error(`Error by bridging tokens: ${error}`);
    }
  }

  private static async _sendEthToken({ web3, wallet, token, amount, gasPrice, nonce }: SendEthTokenType) {
    const gs = await web3.eth.estimateGas({
      from: wallet.address,
      to: config.OrbiterAddress[token.toLowerCase()] as string,
      value: amount,
    });

    const transaction = {
      to: config.OrbiterAddress[token.toLowerCase()] as string,
      value: amount,
      gasLimit: gs,
      gasPrice: gasPrice,
      nonce: nonce, 
    };

    const signed = await web3.eth.accounts.signTransaction(transaction, wallet.privateKey);
    const tx = await web3.eth.sendSignedTransaction(signed.rawTransaction);
    return tx;
  }

  // TODO: This done later
  // private static async _sendUsdcToken({ wallet, amount, token, toChain }: SendUsdcTokenType) {
  //   const recipientAddress = config.OrbiterAddress[token];
  //   const usdcContract = new ethers.Contract(USDC_CONTRACT_BRIDGE, USDC_ABI, wallet);

  //   console.log('amount', amount);
  //   // crutch for the config so as not to swear at access by the nested key
  //   if (typeof recipientAddress !== 'object') {
  //     return;
  //   }

  //   await usdcContract.approve(recipientAddress[toChain], parseUnits(amount, 6));
  //   console.log('Approval successful!');
  //   const tx = {};

  //   return tx;
  // }

  private static async _settingBridgeOptions({
    toNetwork,
    fromNetwork,
    symbol,
    amount,
    wallet,
  }: BridgeParams): Promise<ReturnSettingBridgeOptionsType> {
    const idNetwork = String(config.OrbiterIds[toNetwork.toLowerCase()]);
    const provider = new Web3.providers.HttpProvider(rpcNode[fromNetwork.toLowerCase()]);
    const web3 = new Web3(provider);
    const tokenSymbol = symbol.toLowerCase();
    const gasPrice = await web3.eth.getGasPrice();
    const nonce = await web3.eth.getTransactionCount(wallet.address);
    const buyingAmount =
      tokenSymbol === 'eth'
        ? String(Math.round((Number(amount) * 1e18) / 1000000) * 100).concat(idNetwork)
        : amount.concat(idNetwork);

    return {
      web3,
      tokenSymbol,
      gasPrice,
      nonce,
      buyingAmount,
    };
  }
}
