import { BridgeParams } from 'types/operations.types';
import { Bytes } from 'web3';
import { BridgeOrbiterService } from '../orbiter.service';

export class UtilsOrbiterFinance {
  public static async makeOrbiterFinanceBridge({
    wallet,
    symbol,
    fromNetwork,
    toNetwork,
    amount,
  }: BridgeParams): Promise<Bytes | undefined> {
    // We use the orbiter finance bridge
    const tx = await BridgeOrbiterService.sendViaBridge({
      wallet,
      symbol,
      fromNetwork,
      toNetwork,
      amount,
    });

    return tx?.transactionHash;
  }
}
