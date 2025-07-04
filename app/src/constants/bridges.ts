import { Chains } from './config/chains'
import { contracts } from './config/contracts'

export const bridgeConfig = Object.freeze({
  XDAI: {
    bridgeProxy: '0x4aa42145Aa6Ebf72e164C9bBC74fbD3788045016',
    governorMultisig: '0x42F38ec5A75acCEc50054671233dfAC9C0E7A3F6',
    tokens: {
      dai: '0x6B175474E89094C44Da98b954EedeAC495271d0F',
      usds: '0xdc035d45d973e3ec169d2276ddab16f1e407384f',
    },
    protocol: {
      address: '0x3d9819210A31b4961b30EF54bE2aeD79B9c9Cd3B',
      token: '0xc00e94cb662c3520282e6f5717214004a7f26888',
    },
    bridgeRouter: contracts.BridgeRouter.address[Chains.mainnet],
  },
  OMNI: {
    bridgeProxy: '0x88ad09518695c6c3712AC10a214bE5109a655671',
    governorMultisig: '0x42F38ec5A75acCEc50054671233dfAC9C0E7A3F6',
    tokens: {
      usdc: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
      usdt: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
    },
    protocol: {
      address: '0x87D48c565D0D85770406D248efd7dc3cbd41e729',
    },
  },
})

export type ContractsKeys = keyof typeof bridgeConfig
