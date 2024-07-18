import { ConfigType } from "types/utils.types";

export const configOrbiter: ConfigType = {
  OrbiterAddress: {
    eth: '0xe4edb277e41dc89ab076a1f049f4a3efa700bce8',
    weth: '0xe4edb277e41dc89ab076a1f049f4a3efa700bce8',
    usdc: {
      ethereum: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
      arbitrum: '0x41d3d33156ae7c62c094aae2995003ae63f587b3',
      polygon: '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174',
    },
  },
  OrbiterIds: {
    ethereum: '9001',
    arbitrum: '9002',
    lite: '9003',
    polygon: '9006',
    optimism: '9007',
    zksync: '9014',
    bsc: '9015',
    nova: '9016',
    linea: '9023',
  },
};
