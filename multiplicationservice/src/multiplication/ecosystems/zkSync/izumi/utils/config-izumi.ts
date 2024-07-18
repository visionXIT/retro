export const SLIPPAGE = 90 // 100 % - 10 %
export type IzumiFinanceType = "IzumiFinancePoolFactory" | "IzumiFinanceRouter";

interface IizumiFinanceAddresses {
    [networkName: string]: {
        [interfaceType: string]: string;
    }
}

interface IizumiFinancePoolFeesToETH {
    [token: string]: number;
}

export function getIzumiSwapAddressesByNetwork(networkName: string, interfaceType: IzumiFinanceType) {
    return izumiFinanceAddresses[networkName][interfaceType];
}

export const izumiFinancePoolFeesToETH: IizumiFinancePoolFeesToETH = {
    USDC: 400,
    WBTC: 2000
}

export const allowedTokens = ['ETH', 'USDC', 'WBTC'];

const izumiFinanceAddresses: IizumiFinanceAddresses = {
    zksync: {
        IzumiFinancePoolFactory: '0x575Bfc57B0D3eA0d31b132D622643e71735A6957',
        IzumiFinanceRouter: '0x943ac2310D9BC703d6AB5e5e76876e212100f894'
    }
}

export const IZUMI_BASE_FEE = 400;