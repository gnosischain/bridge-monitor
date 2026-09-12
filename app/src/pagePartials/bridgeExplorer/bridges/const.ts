import { Chains, chainsConfig } from '@/src/constants/config/chains'
import { USDS_ADDRESS } from '@/src/constants/config/common'
import { contracts } from '@/src/constants/config/contracts'
import { USDC_ETHEREUM, USDC_XDAI_OLD, USDCe_GNOSIS } from '@/src/constants/misc'

/** Both bridges are governed by the same multisig. */
const governorMultisig = '0x42F38ec5A75acCEc50054671233dfAC9C0E7A3F6'

/**
 * The addresses the Bridges > Configuration card puts on screen, grouped the way it renders them.
 * Display only — nothing here is called, so these are plain addresses rather than deployments.
 */
export const configurationAddresses = {
  XDAI: {
    bridgeProxy: {
      [Chains.mainnet]: contracts.XDAIBridge[Chains.mainnet].address,
      [Chains.gnosis]: contracts.XDAIBridge[Chains.gnosis].address,
    },
    // the router only exists on the foreign side
    bridgeRouter: {
      [Chains.mainnet]: contracts.BridgeRouter[Chains.mainnet].address,
    },
    governorMultisig,
    tokens: {
      usds: {
        usds: USDS_ADDRESS,
        usdsDeposit: contracts.USDSDeposit[Chains.gnosis].address,
      },
      dai: chainsConfig[Chains.mainnet].bridge.DAI,
    },
  },
  OMNI: {
    bridgeProxy: {
      [Chains.mainnet]: contracts.OmniBridge[Chains.mainnet].address,
      [Chains.gnosis]: contracts.OmniBridge[Chains.gnosis].address,
    },
    governorMultisig,
    tokens: {
      usdc: {
        usdc: USDC_ETHEREUM,
        usdcTransmuter: contracts.Transmuter[Chains.gnosis].address,
        usdcE: USDCe_GNOSIS,
        usdcXdai: USDC_XDAI_OLD,
      },
      usdt: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
    },
  },
} as const
