import { OptionType } from "types/multiplication.types";

export class UtilsBuildObjectForResponse {
  /**
   * @public
   * @description build object for response in methods _loggerStartProcess and _accumulateLogForHistory
   * @see this._loggerStartProcess
   * @see this._accumulateLogForHistory
   */
  public static settingResponseObjectForProcessConfiguration(options: OptionType) {
    const { actionType, fromNetwork, toNetwork, ecoSystem, symbol, tokenSell, tokenBuy, delayAmount } = options;
    const { minAmount, maxAmount } = delayAmount;
    const returnResponse = {
      [`bridge`]: {
        nameProcess: `[Bridge] ${ecoSystem}`,
        from: fromNetwork,
        to: toNetwork,
        tokens: symbol,
      },
      [`swap`]: {
        nameProcess: `[Swap] ${actionType}`,
        from: tokenSell,
        to: tokenBuy,
        amount: `мин. ${minAmount} макс. ${maxAmount}`,
      },
    };
    const modeProcessReturningFields =
      actionType === 'bridgeOrbiter' || actionType === 'bridgeZigZag' || actionType === 'bridgeZkSyncEra'
        ? returnResponse['bridge']
        : returnResponse['swap'];

    return modeProcessReturningFields;
  }
}
