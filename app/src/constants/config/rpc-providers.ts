import { JsonRpcProvider } from '@ethersproject/providers'

import { chainsConfig } from './chains'
import { RPC_CHIADO, RPC_GNOSIS, RPC_MAINNET } from './common'
import { Chains, ChainsValues } from '@/src/constants/config/types'

export const getProviderUrl = (chainId: ChainsValues) => {
  switch (chainId) {
    case Chains.mainnet:
      return RPC_MAINNET
    case Chains.chiado:
      return RPC_CHIADO
    case Chains.gnosis:
      return RPC_GNOSIS
    default:
      throw Error('Token provider could not be found')
  }
}

export const mainnet = () => {
  return new JsonRpcProvider(chainsConfig[Chains.mainnet].rpcUrl, Chains.mainnet)
}
export const chiado = () => {
  return new JsonRpcProvider(chainsConfig[Chains.chiado].rpcUrl, Chains.chiado)
}
export const gnosis = () => {
  return new JsonRpcProvider(chainsConfig[Chains.gnosis].rpcUrl, Chains.gnosis)
}
