import HomeXDAI_abi from '@/src/abis/HomeBridgeErcToNative.json'
import HomeOMNI_abi from '@/src/abis/HomeOmniMediator.json'
import BridgeHelper_abi from '@/src/abis/Erc20ToNativeBridgeHelper.json'
import ForeignAMB_abi from '@/src/abis/ForeignAMB.json'
import HomeAMB_abi from '@/src/abis/HomeAMB.json'
import AMBBridgeHelper_abi from '@/src/abis/AMBBridgeHelper.json'
import { Chains } from '@/src/constants/config/types'

export const contracts = {
  homeXdaiBridge: {
    address: {
      [Chains.mainnet]: '0x4aa42145Aa6Ebf72e164C9bBC74fbD3788045016',
      [Chains.chiado]: '',
      [Chains.gnosis]: '0x7301CFA0e1756B71869E93d4e4Dca5c7d0eb0AA6',
    },
    abi: HomeXDAI_abi,
  },
  homeOmniBridge: {
    address: {
      [Chains.mainnet]: '0x88ad09518695c6c3712AC10a214bE5109a655671',
      [Chains.chiado]: '',
      [Chains.gnosis]: '0xf6A78083ca3e2a662D6dd1703c939c8aCE2e268d',
    },
    abi: HomeOMNI_abi,
  },
  BridgeHelper: {
    address: {
      [Chains.gnosis]: '0x2D51EAa266eafcb59bB36dD3c7E99C515e58113A',
      [Chains.mainnet]: '',
      [Chains.chiado]: '',
    },
    abi: BridgeHelper_abi,
  },
  AMB: {
    address: {
      [Chains.gnosis]: '',
      [Chains.mainnet]: '0x4C36d2919e407f0Cc2Ee3c993ccF8ac26d9CE64e',
      [Chains.chiado]: '',
    },
    abi: ForeignAMB_abi,
  },
  HomeAMB: {
    address: {
      [Chains.gnosis]: '0x75Df5AF045d91108662D8080fD1FEFAd6aA0bb59',
      [Chains.mainnet]: '',
      [Chains.chiado]: '',
    },
    abi: HomeAMB_abi,
  },
  AMBBridgeHelper: {
    address: {
      [Chains.gnosis]: '0x7d94ece17e81355326e3359115D4B02411825EdD',
      [Chains.mainnet]: '',
      [Chains.chiado]: '',
    },
    abi: AMBBridgeHelper_abi,
  },
} as const

export type ContractsKeys = keyof typeof contracts
