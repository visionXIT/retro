export const getMultiplicationEcosytemDataByNetworkName = (networkName: string) => {
    return multiplicationEcosystemMap.get(networkName.toLowerCase());
}

export const toEcosystemId = (networkName: string) => {
    return networkName.toLowerCase() === 'zksync' ? 'zkSync' : networkName.toLowerCase();
}

const multiplicationEcosystemMap = new Map<string, any[]>([
    ["zksync", [
        {
            name: 'bridgeOrbiter',
            type: 'bridge',
        }, 
        {
            name: 'bridgeZkSyncEra',
            type: 'bridge',
        },
        {
            name: 'syncSwap',
            type: 'swap',
        },
        {
            name: 'izumiSwap',
            type: 'swap',
        },
        {
            name: '1inch',
            type: 'aggregation-swap',
        },
        {
            name: 'mute',
            type: 'swap',
        },
        {
            name: 'collector',
            type: 'collector',
        },
    ]],
    ["linea", [
        {
            name: 'bridgeOrbiter',
            type: 'bridge',
        },
        {
            name: 'syncSwap',
            type: 'swap',
        },
        {
            name: 'collector',
            type: 'collector',
        },
    ]],
    ["scroll", [
        {
            name: 'bridgeOrbiter',
            type: 'bridge',
        },
        {
            name: 'syncSwap',
            type: 'swap',
        },
        {
            name: 'collector',
            type: 'collector',
        },
    ]],
]);

