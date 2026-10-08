import { Chains, chainsConfig } from './config/chains'
import { USDS_ADDRESS } from './config/common'
import { contracts } from './config/contracts'
import { TRANSMUTER_ADDRESS, USDC_ETHEREUM, USDC_XDAI_OLD, USDCe_GNOSIS } from './misc'

export const bridgeConfig = Object.freeze({
  XDAI: {
    bridgeProxy: {
      [Chains.mainnet]: contracts.XDAIBridge.address[Chains.mainnet],
      [Chains.gnosis]: contracts.XDAIBridge.address[Chains.gnosis],
    },
    bridgeRouter: {
      [Chains.mainnet]: contracts.BridgeRouter.address[Chains.mainnet],
      [Chains.gnosis]: contracts.BridgeRouter.address[Chains.gnosis],
    },
    governorMultisig: '0x42F38ec5A75acCEc50054671233dfAC9C0E7A3F6',
    tokens: {
      usds: {
        usds: USDS_ADDRESS,
        usdsDeposit: contracts.USDSDeposit.address[Chains.gnosis],
      },
      dai: chainsConfig[Chains.mainnet].bridge.DAI,
    },
  },
  OMNI: {
    bridgeProxy: {
      [Chains.mainnet]: contracts.OmniBridge.address[Chains.mainnet],
      [Chains.gnosis]: contracts.OmniBridge.address[Chains.gnosis],
    },
    governorMultisig: '0x42F38ec5A75acCEc50054671233dfAC9C0E7A3F6',
    tokens: {
      usdc: {
        usdc: USDC_ETHEREUM,
        usdcTransmuter: TRANSMUTER_ADDRESS,
        usdcE: USDCe_GNOSIS,
        usdcXdai: USDC_XDAI_OLD,
      },
      usdt: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
    },
    protocol: {
      address: '0x87D48c565D0D85770406D248efd7dc3cbd41e729',
    },
  },
})
