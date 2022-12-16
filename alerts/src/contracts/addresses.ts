import { ForeignXDAIBridgeAbi, HomeXDAIBridgeAbi } from "../abis"

export const addresses = Object.freeze({
  ForeignBridgeErcToNative: {
    address: "0x4aa42145Aa6Ebf72e164C9bBC74fbD3788045016", // @todo this is an address from Mainnet
    abi: ForeignXDAIBridgeAbi,
  },
  HomeBridgeErcToNative: {
    address: "0x7301CFA0e1756B71869E93d4e4Dca5c7d0eb0AA6", // @todo this is an address from Gnosis Chain
    abi: HomeXDAIBridgeAbi,
  },
})
