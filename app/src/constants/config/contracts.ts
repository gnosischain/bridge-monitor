import { type Address } from 'viem'

import AMBBridgeHelper_abi from '@/src/abis/AMBBridgeHelper'
import BridgeHelper_abi from '@/src/abis/Erc20ToNativeBridgeHelper'
import BridgeHelper_beforeUsdsMigration_abi from '@/src/abis/Erc20ToNativeBridgeHelper_beforeUSDSMigration'
import ForeignAMB_abi from '@/src/abis/ForeignAMB'
import ForeignBridgeRouter_abi from '@/src/abis/ForeignBridgeRouter'
import ForeignOmniMediator_abi from '@/src/abis/ForeignOmniMediator'
import ForeignXDAI_abi from '@/src/abis/ForeignBridgeErcToNative'
import HomeAMB_abi from '@/src/abis/HomeAMB'
import OMNI_FEE_MANAGER_abi from '@/src/abis/OmniBridgeFeeManager'
import OmniMediator_abi from '@/src/abis/HomeOmniMediator'
import NativeOmniBridgeMediator_abi from '@/src/abis/NativeOmniBridgeMediator'
import USDSDeposit_abi from '@/src/abis/USDSdeposit'
import XDAI_abi from '@/src/abis/HomeBridgeErcToNative'
import { Chains, ChainsValues } from '@/src/constants/config/types'

/** One deployment: the address of a contract on a chain, paired with the ABI at that address. */
type ContractDeployment = { address: Address; abi: readonly unknown[] }

/** A contract is a map of the chains it is deployed on — chains it isn't on are simply absent. */
type ContractRegistry = Record<string, Partial<Record<ChainsValues, ContractDeployment>>>

export const contracts = {
  XDAIBridge: {
    [Chains.mainnet]: {
      address: '0x4aa42145Aa6Ebf72e164C9bBC74fbD3788045016',
      abi: ForeignXDAI_abi,
    },
    [Chains.gnosis]: {
      address: '0x7301CFA0e1756B71869E93d4e4Dca5c7d0eb0AA6',
      abi: XDAI_abi,
    },
  },
  OmniBridge: {
    [Chains.mainnet]: {
      address: '0x88ad09518695c6c3712AC10a214bE5109a655671',
      abi: ForeignOmniMediator_abi,
    },
    [Chains.gnosis]: {
      address: '0xf6A78083ca3e2a662D6dd1703c939c8aCE2e268d',
      abi: OmniMediator_abi,
    },
  },
  // native tokens omnibridge mediator.
  // Used to wrap and relay native tokens from foreign chain to home. Example: ETH > WETH
  omniBridgeNativeToken: {
    [Chains.mainnet]: {
      address: '0xa6439ca0fcba1d0f80df0be6a17220fed9c9038a',
      abi: NativeOmniBridgeMediator_abi,
    },
  },
  AMB: {
    [Chains.mainnet]: {
      address: '0x4C36d2919e407f0Cc2Ee3c993ccF8ac26d9CE64e',
      abi: ForeignAMB_abi,
    },
    [Chains.gnosis]: {
      address: '0x75Df5AF045d91108662D8080fD1FEFAd6aA0bb59',
      abi: HomeAMB_abi,
    },
  },
  omnibridgeFeeManager: {
    [Chains.gnosis]: {
      address: '0x5dbc897aef6b18394d845a922bf107fa98e3ac55',
      abi: OMNI_FEE_MANAGER_abi,
    },
  },
  BridgeHelper__beforeUsdsMigration: {
    [Chains.gnosis]: {
      address: '0x2D51EAa266eafcb59bB36dD3c7E99C515e58113A',
      abi: BridgeHelper_beforeUsdsMigration_abi,
    },
  },
  BridgeHelper: {
    [Chains.gnosis]: {
      address: '0xe30269bc61E677cD60aD163a221e464B7022fbf5',
      abi: BridgeHelper_abi,
    },
  },
  AMBBridgeHelper: {
    [Chains.gnosis]: {
      address: '0x7d94ece17e81355326e3359115D4B02411825EdD',
      abi: AMBBridgeHelper_abi,
    },
  },
  BridgeRouter: {
    [Chains.mainnet]: {
      address: '0x9a873656c19Efecbfb4f9FAb5B7acdeAb466a0B0',
      abi: ForeignBridgeRouter_abi,
    },
  },
  USDSDeposit: {
    [Chains.gnosis]: {
      address: '0x5C183C8A49aBA6e31049997a56D75600E27FF8c9',
      abi: USDSDeposit_abi,
    },
  },
} as const satisfies ContractRegistry

export const contractOn = <T extends object>(
  contract: T,
  chainId: ChainsValues,
): T[keyof T] | undefined =>
  (contract as unknown as Record<number, T[keyof T] | undefined>)[chainId]
