import ERC_20_abi from '@/src/abis/ERC20.json'
import HomeXDAI_abi from '@/src/abis/HomeBridgeErcToNative.json'
import HomeOMNI_abi from '@/src/abis/HomeOmniMediator.json'
import GNO_abi from '@/src/abis/GNO.json'
import INCH_abi from '@/src/abis/1INCH.json'
import BridgeHelper_abi from '@/src/abis/Erc20ToNativeBridgeHelper.json'
import ForeignAMB_abi from '@/src/abis/ForeignAMB.json'
import HomeAMB_abi from '@/src/abis/HomeAMB.json'
import AMBBridgeHelper_abi from '@/src/abis/AMBBridgeHelper.json'
import { Chains } from '@/src/constants/config/types'

export const contracts = Object.freeze({
  DAI: {
    address: {
      [Chains.mainnet]: '0x6B175474E89094C44Da98b954EedeAC495271d0F',
      [Chains.chiado]: '',
      [Chains.gnosis]: '', // @todo complete
    },
    abi: ERC_20_abi,
  },
  USDC: {
    address: {
      [Chains.mainnet]: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
      [Chains.chiado]: '',
      [Chains.gnosis]: '', // @todo complete
    },
    abi: ERC_20_abi,
  },
  XDAI: {
    address: {
      [Chains.mainnet]: '0x4aa42145Aa6Ebf72e164C9bBC74fbD3788045016',
      [Chains.chiado]: '',
      [Chains.gnosis]: '0x7301CFA0e1756B71869E93d4e4Dca5c7d0eb0AA6',
    },
    abi: HomeXDAI_abi,
  },
  GNO: {
    address: {
      [Chains.mainnet]: '0x6810e776880c02933d47db1b9fc05908e5386b96',
      [Chains.chiado]: '',
      [Chains.gnosis]: '0x9C58BAcC331c9aa871AFD802DB6379a98e80CEdb',
    },
    abi: GNO_abi,
  },
  INCH: {
    address: {
      [Chains.mainnet]: '0x111111111117dc0aa78b770fa6a738034120c302',
      [Chains.chiado]: '',
      [Chains.gnosis]: '',
    },
    abi: INCH_abi,
  },
  OMNI: {
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
})

export type ContractsKeys = keyof typeof contracts
