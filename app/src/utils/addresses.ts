import foreignXDAI from '@/src/abis/ForeignBridgeErcToNative.json'
import foreignOMNIMediator from '@/src/abis/ForeignOmniMediator.json'
import homeOMNIMediator from '@/src/abis/ForeignOmniMediator.json'
import homeXDAI from '@/src/abis/HomeBridgeErcToNative.json'
import { Chains } from '@/src/constants/config/chains'
import { Contracts } from '@/types/Contracts'

export const addresses: {
  [key in keyof typeof Chains]: {
    [key in keyof typeof Contracts]: { address: string; abi: any[] }
  }
} = {
  mainnet: {
    XDAI: {
      address: '0x7301CFA0e1756B71869E93d4e4Dca5c7d0eb0AA6',
      abi: foreignXDAI,
    },
    OMNI: {
      address: '',
      abi: foreignOMNIMediator,
    },
  },
  goerli: {
    XDAI: { address: '', abi: foreignXDAI },
    OMNI: { address: '', abi: foreignOMNIMediator },
  },
  gnosis: {
    XDAI: {
      address: '0x4aa42145Aa6Ebf72e164C9bBC74fbD3q788045016',
      abi: homeXDAI,
    },
    OMNI: {
      address: '0xf6A78083ca3e2a662D6dd1703c939c8aCE2e268d',
      abi: homeOMNIMediator,
    },
  },
}
