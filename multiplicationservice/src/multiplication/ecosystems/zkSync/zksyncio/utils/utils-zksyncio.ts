import { Provider, Wallet } from 'zksync-web3';
import { getDefaultProvider } from 'ethers';
import { rpcNode } from '../../../../../multiplication/utils/utils-config';
import { ZksyncioService } from '../zksyncio.service';
import { BridgeParams } from 'types/operations.types';

export class UtilsZksyncio {
  public static async makeZksyncioBridge({
    wallet,
    amount,
    symbol,
    fromNetwork,
    toNetwork,
    courses
  }: BridgeParams): Promise<string> {
    const zkSyncProvider = new Provider(rpcNode['zksync']);
    const ethProvider = getDefaultProvider(rpcNode['ethereum']);

    const zkwallet = new Wallet(wallet.privateKey, zkSyncProvider, ethProvider);
    if (toNetwork.toLowerCase() === 'zksync' && fromNetwork.toLowerCase() === 'ethereum') {
      return ZksyncioService.bridgeEthToZksync(zkwallet, amount, symbol, courses?.courseEth, courses?.course);
    }

    if (toNetwork.toLowerCase() === 'ethereum' && fromNetwork.toLowerCase() === 'zksync') {
      return ZksyncioService.bridgeZksyncToEth(zkwallet, amount, symbol, courses?.courseEth, courses?.course);
    }

    throw new Error('Can bridge only from zkSync to Ethereum or from Ethereum to zkSync');
  }
}
