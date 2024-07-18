import { ETH_USDC_POOL_ID, ETH_WBTC_POOL_ID, USDC_ETH_POOL_ID, USDC_WBTC_POOL_ID, WBTC_ETH_POOL_ID, WBTC_USDC_POOL_ID } from "./pool-constants";
import { ETH_ADDRESS_ZKSYNC, USDC_ADDRESS_ZKSYNC, WBTC_ADDRESS_ZKSYNC } from "./token-constants";

export const SLIPPAGE = 90 // 100 % - 10 %
export type SyncSwapType = "SyncSwapClassicPoolFactory" | "SyncSwapRouter";


//* @returns router address for 1inch Aggregation router V5
//* Allowed networks `zkSync` `ethereum`
export function getAggregationRouterAddressByNetwork(networkName: string): string {
  return oneInchAggregationRouterV5[networkName];
}

const oneInchAggregationRouterV5: Record<string, string> = {
  zksync: "0x6e2b76966cbd9cf4cc2fa0d76d24d5241e0abc2f",
  ethereum: "0x1111111254eeb25477b68fb85ed929f73a960582",
}




//* @returns pool ID for specific pair in 1inch
export function tryGetPoolIdForOneInchAggregatedForSpaceFi(tokenIn: string, tokenOut: string): string[] {
  const pool = mapPairId.get(`${tokenIn.toLowerCase()}-${tokenOut.toLowerCase()}`);

  if(pool === undefined) {
      throw new Error(`Pool Error: Retro doesn't supports pool pair in 1inch such as ${tokenIn}->${tokenOut}`);
  }

  return pool;
}

const mapPairId = new Map<string, string[]>([
  [`0x0000000000000000000000000000000000000000-${USDC_ADDRESS_ZKSYNC.toLowerCase()}`, ETH_USDC_POOL_ID],
  [`0x0000000000000000000000000000000000000000-${WBTC_ADDRESS_ZKSYNC.toLowerCase()}`, ETH_WBTC_POOL_ID],
  [`${ETH_ADDRESS_ZKSYNC.toLowerCase()}-${USDC_ADDRESS_ZKSYNC.toLowerCase()}`, ETH_USDC_POOL_ID],
  [`${ETH_ADDRESS_ZKSYNC.toLowerCase()}-${WBTC_ADDRESS_ZKSYNC.toLowerCase()}`, ETH_WBTC_POOL_ID],
  [`${WBTC_ADDRESS_ZKSYNC.toLowerCase()}-${ETH_ADDRESS_ZKSYNC.toLowerCase()}`, WBTC_ETH_POOL_ID],
  [`${WBTC_ADDRESS_ZKSYNC.toLowerCase()}-${USDC_ADDRESS_ZKSYNC.toLowerCase()}`, WBTC_USDC_POOL_ID],
  [`${USDC_ADDRESS_ZKSYNC.toLowerCase()}-${ETH_ADDRESS_ZKSYNC.toLowerCase()}`, USDC_ETH_POOL_ID],
  [`${USDC_ADDRESS_ZKSYNC.toLowerCase()}-${WBTC_ADDRESS_ZKSYNC.toLowerCase()}`, USDC_WBTC_POOL_ID],
]);