import { providers } from 'ethers';

const ADDRESS_ZERO = '0x0000000000000000000000000000000000000000';


export const rpcNode: { [key: string]: string } = {
  ethereum: 'https://eth.llamarpc.com',
  arbitrum: 'https://arbitrum-one.publicnode.com',
  lite: 'https://uptime.com/s/zkSync',
  polygon: 'https://polygon-pokt.nodies.app',
  optimism: 'https://optimism.meowrpc.com',
  zksync: 'https://1rpc.io/zksync2-era',
  bsc: 'https://bsc.publicnode.com',
  nova: 'https://arbitrum-nova.publicnode.com',
  linea: 'https://1rpc.io/linea',
  'bnb chain': 'https://binance.llamarpc.com',
  scroll: 'https://rpc.scroll.io'
};

export const zksyncTokenAddresses = new Map<string, string>([
  ['ETH', '0x000000000000000000000000000000000000800A'],
  ['USDC', '0x3355df6D4c9C3035724Fd0e3914dE96A5a83aaf4'],
  ['WETH', '0x5aea5775959fbc2557cc8789bc1bf90a239d9a91'],
  ['MUTE', '0x0e97C7a0F8B2C9885C8ac9fC6136e829CbC21d42'],
  ['WBTC', '0xBBeB516fb02a01611cBBE0453Fe3c580D7281011'],
  ['COMBO', '0xc2B13Bb90E33F1E191b8aA8F44Ce11534D5698E3'],
  ['PERP', '0x42c1c56be243c250AB24D2ecdcC77F9cCAa59601'],
]);

export const ethTokenAddresses = new Map<string, string>([
  ['ETH', ADDRESS_ZERO],
  ['USDC', '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48'],
  ['WBTC', '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599'],
]);

export const lineTokenAddresses = new Map<string, string>([
  ['ETH', ADDRESS_ZERO],
  ['USDC', '0x176211869cA2b568f2A7D4EE941E073a821EE1ff'],
  ['USDT', '0xA219439258ca9da29E9Cc4cE5596924745e12B93'],
  ['DAI', '0x4AF15ec2A0BD43Db75dd04E62FAA3B8EF36b00d5'],
  ['WETH', '0xe5D7C2a44FfDDf6b295A15c148167daaAf5Cf34f'], // WETH address at linea: https://lineascan.build/address/0xe5d7c2a44ffddf6b295a15c148167daaaf5cf34f
  ['WBTC', '0x3aAB2285ddcDdaD8edf438C1bAB47e1a9D05a9b4'],
  ['APE', '0x6bAA318CF7C51C76e17ae1EbE9Bbff96AE017aCB'],
  ['DVF', '0x1f031f8c523b339c7a831355879e3568fa3eb263'],
  ['HAPI', '0x0e5F2ee8C29e7eBc14e45dA7FF90566d8c407dB7'],
  ['KNC', '0x3b2F62d42DB19B30588648bf1c184865D4C3B1D6'],
  ['LDO', '0x0e076AAFd86a71dCEAC65508DAF975425c9D0cB6'],
  ['LINK', '0x5B16228B94b68C7cE33AF2ACc5663eBdE4dCFA2d'],
  ['PEPE', '0x7da14988E4f390C2E34ed41DF1814467D3aDe0c3'],
  ['SHIB', '0x99AD925C1Dc14Ac7cc6ca1244eeF8043C74E99d5'],
  ['UNI', '0x636B22bC471c955A8DB60f28D4795066a8201fa3'],
]);

export function getTokenAddressByNetwork(
  network: string | string[] | number,
  tokenSymbol: string,
  useWethAsEth?: boolean | null | undefined,
): string {
  const networkName: string = getNetworkName(network);
  // const networkLowerCase = network.toLowerCase();
  let tokenSymbolLowerCase = tokenSymbol.toLowerCase();

  if (tokenSymbolLowerCase === 'eth' && useWethAsEth === true) {
    tokenSymbolLowerCase = 'weth';
  }

  return tokenData[networkName][tokenSymbolLowerCase];
}

export function getNetworkName(network: string | string[] | number) {
  let networkName: string;

  switch (typeof network) {
    case 'number':
      networkName = networkNameByChainId.get(network) as string;
      break;
    case 'string':
      networkName = network.toLowerCase();
      break;
    default:
      throw new Error(`Network is not found '${network}'`);
  }

  return networkName;
}

/// @return Возвращает ethereum по умолчанию
export function getJsonRpcProviderByNetworkName(networkName?: string | null | undefined) {
  const networkNameStr: string = networkName ? networkName : 'ethereum';
  const rpc = rpcNode[networkNameStr];
  if (!rpc) {
    throw new Error(`Network ${networkName} is not supported`);
  }
  return new providers.JsonRpcProvider(rpc);
}

export const networkNameByChainId = new Map<number, string>([
  [1, 'ethereum'],
  [56, 'bsc'],
  [137, 'polygon'],
  [10, 'optimism'],
  [59144, 'linea'],
  [324, 'zksync'],
  [534352, 'scroll']
]);

export const nativeCurrencyByChainId = new Map<number, string>([
  [1, 'ETH'],
  [56, 'BNB'],
  [137, 'MATIC'],
  [10, 'ETH'],
  [59144, 'ETH'],
  [324, 'ETH'],
  [534352, 'ETH']
]);

export const nativeCurrencyWraperByChainId = new Map<number, string>([
  [1, 'WETH'],
  [56, 'WBNB'],
  [137, 'WMATIC'],
  [10, 'WETH'],
  [59144, 'WETH'],
  [324, 'WETH'],
  [534352, 'WETH']
]);

const tokenData: any = {
  ethereum: {
    eth: ADDRESS_ZERO,
    weth: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
    wbtc: '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599',
  },
  linea: {
    eth: ADDRESS_ZERO,
    weth: '0xe5D7C2a44FfDDf6b295A15c148167daaAf5Cf34f',
    wbtc: '0x3aAB2285ddcDdaD8edf438C1bAB47e1a9D05a9b4',
    usdc: '0x176211869cA2b568f2A7D4EE941E073a821EE1ff',
    usdt: '0xA219439258ca9da29E9Cc4cE5596924745e12B93',
    dai: '0x4AF15ec2A0BD43Db75dd04E62FAA3B8EF36b00d5',
    ape: '0x6bAA318CF7C51C76e17ae1EbE9Bbff96AE017aCB',
    dvf: '0x1f031f8c523b339c7a831355879e3568fa3eb263',
    hapi: '0x0e5F2ee8C29e7eBc14e45dA7FF90566d8c407dB7',
    knc: '0x3b2F62d42DB19B30588648bf1c184865D4C3B1D6',
    ldo: '0x0e076AAFd86a71dCEAC65508DAF975425c9D0cB6',
    link: '0x5B16228B94b68C7cE33AF2ACc5663eBdE4dCFA2d',
    pepe: '0x7da14988E4f390C2E34ed41DF1814467D3aDe0c3',
    shib: '0x99AD925C1Dc14Ac7cc6ca1244eeF8043C74E99d5',
    uni: '0x636B22bC471c955A8DB60f28D4795066a8201fa3',
  },
  zksync: {
    eth: '0x000000000000000000000000000000000000800A',
    weth: '0x5AEa5775959fBC2557Cc8789bC1bf90A239D9a91',
    wbtc: '0xBBeB516fb02a01611cBBE0453Fe3c580D7281011',
    usdc: '0x3355df6D4c9C3035724Fd0e3914dE96A5a83aaf4',
    combo: '0xc2B13Bb90E33F1E191b8aA8F44Ce11534D5698E3',
    perp: '0x42c1c56be243c250AB24D2ecdcC77F9cCAa59601',
  },
  scroll: {
    eth: '0x781e90f1c8Fc4611c9b7497C3B47F99Ef6969CbC',
    usdc: '0x06eFdBFf2a14a7c8E15944D1F4A48F9F95F663A4',
    weth: '0x5300000000000000000000000000000000000004',
    usdt: '0xf55BEC9cafDbE8730f096Aa55dad6D22d44099Df',
    wbtc: '0x3C1BCa5a656e69edCD0D4E36BEbb3FcDAcA60Cf1',
    dai: '0xcA77eB3fEFe3725Dc33bccB54eDEFc3D9f764f97'
  }
};

export const numDecimals = new Map<string, { min: number; max: number }>([
  ['ETH', { min: 5, max: 8 }],
  ['WETH', { min: 5, max: 8 }],
  ['WBTC', { min: 6, max: 8 }],
  ['USDC', { min: 1, max: 5 }],
  ['USDT', { min: 1, max: 5 }],
  ['DAI', { min: 1, max: 5 }],
]);
