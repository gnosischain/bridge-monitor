import XDAI_abi from '@/src/abis/HomeBridgeErcToNative' // TODO: maybe we can unified the names of the ABI files too.
import FOREIGN_XDAI_abi from '@/src/abis/ForeignBridgeErcToNative'
import OMNI_abi from '@/src/abis/HomeOmniMediator' // TODO: maybe we can unified the names of the ABI files too.
import BridgeHelper_beforeUsdsMigration_abi from '@/src/abis/Erc20ToNativeBridgeHelper_beforeUSDSMigration'
import BridgeHelper_abi from '@/src/abis/Erc20ToNativeBridgeHelper'
import AMB_abi from '@/src/abis/HomeAMB' // TODO: maybe we can unified the names of the ABI files too.
import OMNI_FEE_MANAGER_abi from '@/src/abis/OmniBridgeFeeManager'
import AMBBridgeHelper_abi from '@/src/abis/AMBBridgeHelper'
import NativeOmniBridgeMediator_abi from '@/src/abis/NativeOmniBridgeMediator'
import USDSDeposit_abi from '@/src/abis/USDSdeposit'
import { Chains } from '@/src/constants/config/types'

export const contracts = {
  XDAIBridge: {
    address: {
      [Chains.mainnet]: '0x4aa42145Aa6Ebf72e164C9bBC74fbD3788045016', // foreignXdaiBridge
      [Chains.gnosis]: '0x7301CFA0e1756B71869E93d4e4Dca5c7d0eb0AA6', // homeXdaiBridge
    },
    abi: XDAI_abi,
  },
  OmniBridge: {
    address: {
      [Chains.mainnet]: '0x88ad09518695c6c3712AC10a214bE5109a655671', // foreignOmniBridge
      [Chains.gnosis]: '0xf6A78083ca3e2a662D6dd1703c939c8aCE2e268d', // homeOmniBridge
    },
    abi: OMNI_abi,
  },
  // native tokens omnibridge mediator.
  // Used to wrap and relay native tokens from foreign chain to home. Example: ETH > WETH
  omniBridgeNativeToken: {
    address: {
      [Chains.mainnet]: '0xa6439ca0fcba1d0f80df0be6a17220fed9c9038a',
      [Chains.gnosis]: '',
    },
    abi: NativeOmniBridgeMediator_abi,
  },
  AMB: {
    address: {
      [Chains.mainnet]: '0x4C36d2919e407f0Cc2Ee3c993ccF8ac26d9CE64e',
      [Chains.gnosis]: '0x75Df5AF045d91108662D8080fD1FEFAd6aA0bb59',
    },
    abi: AMB_abi,
  },
  omnibridgeFeeManager: {
    address: {
      [Chains.mainnet]: '',
      [Chains.gnosis]: '0x5dbc897aef6b18394d845a922bf107fa98e3ac55',
    },
    abi: OMNI_FEE_MANAGER_abi,
  },
  BridgeHelper__beforeUsdsMigration: {
    address: {
      [Chains.mainnet]: '',
      [Chains.gnosis]: '0x2D51EAa266eafcb59bB36dD3c7E99C515e58113A',
    },
    abi: BridgeHelper_beforeUsdsMigration_abi,
  },
  BridgeHelper: {
    address: {
      [Chains.mainnet]: '',
      [Chains.gnosis]: '0xe30269bc61E677cD60aD163a221e464B7022fbf5',
    },
    abi: BridgeHelper_abi,
  },
  AMBBridgeHelper: {
    address: {
      [Chains.mainnet]: '',
      [Chains.gnosis]: '0x7d94ece17e81355326e3359115D4B02411825EdD',
    },
    abi: AMBBridgeHelper_abi,
  },
  BridgeRouter: {
    address: {
      [Chains.mainnet]: '0x9a873656c19Efecbfb4f9FAb5B7acdeAb466a0B0',
      [Chains.gnosis]: '',
    },
  },
  USDSDeposit: {
    address: {
      [Chains.mainnet]: '',
      [Chains.gnosis]: '0x5C183C8A49aBA6e31049997a56D75600E27FF8c9',
    },
    abi: USDSDeposit_abi,
  },
} as const

export type ContractsKeys = keyof typeof contracts

export const homeXdaiBridgeContract = {
  address: contracts.XDAIBridge.address[Chains.gnosis] as `0x${string}`,
  abi: contracts.XDAIBridge.abi,
  chainId: Chains.gnosis,
} as const

export const foreignXdaiBridgeContract = {
  address: contracts.XDAIBridge.address[Chains.mainnet] as `0x${string}`,
  abi: FOREIGN_XDAI_abi,
  chainId: Chains.mainnet,
} as const

export const homeOmniBridgeContract = {
  address: contracts.OmniBridge.address[Chains.gnosis] as `0x${string}`,
  abi: contracts.OmniBridge.abi,
  chainId: Chains.gnosis,
} as const

export const foreignOmniBridgeContract = {
  address: contracts.OmniBridge.address[Chains.mainnet] as `0x${string}`,
  abi: contracts.OmniBridge.abi,
  chainId: Chains.mainnet,
} as const

export const homeAmbContract = {
  address: contracts.AMB.address[Chains.gnosis] as `0x${string}`,
  abi: contracts.AMB.abi,
  chainId: Chains.gnosis,
} as const

export const foreignAmbContract = {
  address: contracts.AMB.address[Chains.mainnet] as `0x${string}`,
  abi: contracts.AMB.abi,
  chainId: Chains.mainnet,
} as const

export const omniBridgeFeeManagerContract = {
  address: contracts.omnibridgeFeeManager.address[Chains.gnosis] as `0x${string}`,
  abi: contracts.omnibridgeFeeManager.abi,
  chainId: Chains.gnosis,
} as const

export const bridgeHelperContract = {
  address: contracts.BridgeHelper.address[Chains.gnosis] as `0x${string}`,
  abi: contracts.BridgeHelper.abi,
  chainId: Chains.gnosis,
} as const

export const bridgeHelperBeforeUsdsMigrationContract = {
  address: contracts.BridgeHelper__beforeUsdsMigration.address[Chains.gnosis] as `0x${string}`,
  abi: contracts.BridgeHelper__beforeUsdsMigration.abi,
  chainId: Chains.gnosis,
} as const

export const ambBridgeHelperContract = {
  address: contracts.AMBBridgeHelper.address[Chains.gnosis] as `0x${string}`,
  abi: contracts.AMBBridgeHelper.abi,
  chainId: Chains.gnosis,
} as const

export const usdsDepositContract = {
  address: contracts.USDSDeposit.address[Chains.gnosis] as `0x${string}`,
  abi: contracts.USDSDeposit.abi,
  chainId: Chains.gnosis,
} as const
