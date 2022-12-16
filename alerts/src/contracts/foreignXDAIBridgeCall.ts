import { call } from "./contracts"
import { RPCProvider } from "../providers"
import { ForeignBridgeErcToNative } from "../types/typechain"
import { addresses } from "./addresses"

const foreignXDAIBridgeCall = <
  Method extends keyof ForeignBridgeErcToNative["functions"],
  Params extends Parameters<ForeignBridgeErcToNative[Method]>,
  Return extends ReturnType<ForeignBridgeErcToNative[Method]> | null,
>(provider: RPCProvider, method: Method, params: Params): Promise<Return> =>  {
  const ADDRESS = addresses.ForeignBridgeErcToNative.address
  const ABI = addresses.ForeignBridgeErcToNative.abi
  return call(provider, ADDRESS, ABI, method, params)
}

export default foreignXDAIBridgeCall
