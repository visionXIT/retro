export const SLIPPAGE = 90 // 100 % - 10 %
export type SyncSwapType = "SyncSwapClassicPoolFactory" | "SyncSwapRouter";

export function getSyncSwapAddressesByNetwork(networkName: string, interfaceType: SyncSwapType) {
  return syncSwapAddresses[networkName][interfaceType];
}

const syncSwapAddresses: any = {
  zksync: {
    SyncSwapClassicPoolFactory: '0xf2DAd89f2788a8CD54625C60b55cD3d2D0ACa7Cb',
    SyncSwapRouter: '0x2da10A1e27bF85cEdD8FFb1AbBe97e53391C0295',
  },
  linea: {
    SyncSwapClassicPoolFactory: '0x37BAc764494c8db4e54BDE72f6965beA9fa0AC2d',
    SyncSwapRouter: '0x80e38291e06339d10AAB483C65695D004dBD5C69',
  },
  scroll: {
    SyncSwapClassicPoolFactory: '0x37BAc764494c8db4e54BDE72f6965beA9fa0AC2d',
    SyncSwapRouter: '0x80e38291e06339d10AAB483C65695D004dBD5C69'
  }
}