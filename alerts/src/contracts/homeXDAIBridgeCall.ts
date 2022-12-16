import { call } from "./contracts"
import { RPCProvider } from "../providers"
import { HomeBridgeErcToNative } from "../types/typechain"
import { addresses } from "./addresses"

const homeXDAIBridgeCall = <
  Method extends keyof HomeBridgeErcToNative["functions"],
  Params extends Parameters<HomeBridgeErcToNative[Method]>,
  Return extends ReturnType<HomeBridgeErcToNative[Method]>,
>(provider: RPCProvider, method: Method, params: Params): Promise<Return> =>  {
  const ADDRESS = addresses.HomeBridgeErcToNative.address
  const ABI = addresses.HomeBridgeErcToNative.abi
  return call(provider, ADDRESS, ABI, method, params)
}

export default homeXDAIBridgeCall
