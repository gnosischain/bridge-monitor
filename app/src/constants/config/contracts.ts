import HomeXDAI_abi from '@/src/abis/HomeBridgeErcToNative.json'
import ForeignXDAI_abi from '@/src/abis/ForeignBridgeErcToNative.json'
import HomeOMNI_abi from '@/src/abis/HomeOmniMediator.json'
import ForeignOMNI_abi from '@/src/abis/ForeignOmniMediator.json'
import BridgeHelper_abi from '@/src/abis/Erc20ToNativeBridgeHelper.json'
import ForeignAMB_abi from '@/src/abis/ForeignAMB.json'
import HomeAMB_abi from '@/src/abis/HomeAMB.json'
import OMNI_FEE_MANAGER_abi from '@/src/abis/OmniBridgeFeeManager.json'
import AMBBridgeHelper_abi from '@/src/abis/AMBBridgeHelper.json'
import { Chains } from '@/src/constants/config/types'

export enum BridgeContractKey {
  HomeOmniBridge = 'homeOmniBridge',
  ForeignOmniBridge = 'foreignOmniBridge',
  HomeXdaiBridge = 'homeXdaiBridge',
  ForeignXdaiBridge = 'foreignXdaiBridge',
}

export const contracts = {
  // XDAI Bridge on Gnosis contract
  homeXdaiBridge: {
    address: {
      [Chains.mainnet]: '',
      [Chains.chiado]: '',
      [Chains.gnosis]: '0x7301CFA0e1756B71869E93d4e4Dca5c7d0eb0AA6',
    },
    abi: HomeXDAI_abi,
  },
  // XDAI Bridge on Mainnet contract
  foreignXdaiBridge: {
    address: {
      [Chains.mainnet]: '0x4aa42145Aa6Ebf72e164C9bBC74fbD3788045016',
      [Chains.chiado]: '',
      [Chains.gnosis]: '',
    },
    abi: ForeignXDAI_abi,
  },
  // Omni Bridge on gnosis contract
  homeOmniBridge: {
    address: {
      [Chains.mainnet]: '',
      [Chains.chiado]: '',
      [Chains.gnosis]: '0xf6A78083ca3e2a662D6dd1703c939c8aCE2e268d',
    },
    abi: HomeOMNI_abi,
  },
  // Omni Bridge on mainnet contract
  foreignOmniBridge: {
    address: {
      [Chains.mainnet]: '0x88ad09518695c6c3712AC10a214bE5109a655671',
      [Chains.chiado]: '',
      [Chains.gnosis]: '',
    },
    abi: ForeignOMNI_abi,
  },
  nativeOmniBridgeMediator: {
    address: {
      [Chains.mainnet]: '0xa6439ca0fcba1d0f80df0be6a17220fed9c9038a',
      [Chains.chiado]: '',
      [Chains.gnosis]: '',
    },
    abi: [],
  },
  omnibridgeFeeManager: {
    address: {
      [Chains.mainnet]: '',
      [Chains.chiado]: '',
      [Chains.gnosis]: '0x5dbc897aef6b18394d845a922bf107fa98e3ac55',
    },
    abi: OMNI_FEE_MANAGER_abi,
  },
  BridgeHelper: {
    address: {
      [Chains.mainnet]: '',
      [Chains.chiado]: '',
      [Chains.gnosis]: '0x2D51EAa266eafcb59bB36dD3c7E99C515e58113A',
    },
    abi: BridgeHelper_abi,
  },
  AMB: {
    address: {
      [Chains.mainnet]: '0x4C36d2919e407f0Cc2Ee3c993ccF8ac26d9CE64e',
      [Chains.chiado]: '',
      [Chains.gnosis]: '',
    },
    abi: ForeignAMB_abi,
  },
  HomeAMB: {
    address: {
      [Chains.mainnet]: '',
      [Chains.chiado]: '',
      [Chains.gnosis]: '0x75Df5AF045d91108662D8080fD1FEFAd6aA0bb59',
    },
    abi: HomeAMB_abi,
  },
  AMBBridgeHelper: {
    address: {
      [Chains.mainnet]: '',
      [Chains.chiado]: '',
      [Chains.gnosis]: '0x7d94ece17e81355326e3359115D4B02411825EdD',
    },
    abi: AMBBridgeHelper_abi,
  },
} as const

export type ContractsKeys = keyof typeof contracts
