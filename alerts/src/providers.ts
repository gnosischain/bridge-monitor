import { JsonRpcProvider, JsonRpcSigner,  } from "@ethersproject/providers"

export type RPCProvider = JsonRpcProvider | JsonRpcSigner

const mainnet = () => {
  const mainnetRPC = process.env.MAINNET_RPC_URL || ''
  const mainnetChain = 1
  return new JsonRpcProvider(mainnetRPC, mainnetChain)
}

const gnosis = () => {
  const gnosisRPC = process.env.GNOSIS_RPC_URL || ''
  const gnosisChain = 100
  return new JsonRpcProvider(gnosisRPC, gnosisChain)
}

export { mainnet, gnosis }
