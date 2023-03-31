import { JsonRpcProvider } from '@ethersproject/providers'

import { chainsConfig } from './chains'
import { RPC_GNOSIS, RPC_GOERLI, RPC_MAINNET } from './common'
import {
  Chains,
  ChainsValues,
  ProviderChains,
  RPCProviders,
  RPCProvidersENV,
} from '@/src/constants/config/types'
import { ObjectValues } from '@/types/utils'

export const providerChains: ProviderChains = {
  [RPCProviders.infura]: {
    [Chains.mainnet]: 'mainnet',
    [Chains.goerli]: 'goerli',
    [Chains.gnosis]: 'gnosis',
  },
  [RPCProviders.alchemy]: {
    [Chains.mainnet]: 'eth-mainnet',
    [Chains.goerli]: 'eth-goerli',
    [Chains.gnosis]: 'gnosis',
  },
}

const getInfuraRPCUrl = (chainId: ChainsValues) =>
  `https://${providerChains[RPCProviders.infura][chainId]}.infura.io/v3/${
    process.env.NEXT_PUBLIC_INFURA_TOKEN
  }`

const getAlchemyRPCUrl = (chainId: ChainsValues) =>
  `https://${providerChains[RPCProviders.alchemy][chainId]}.g.alchemy.com/v2/${
    process.env.NEXT_PUBLIC_ALCHEMY_TOKEN
  }`

export const getProviderUrl = (
  chainId: ChainsValues,
  provider?: ObjectValues<typeof RPCProviders>,
) => {
  ///////////////////////////////////////////////////////////////////////////////////////
  // if (!RPCProvidersENV[RPCProviders.infura] && !RPCProvidersENV[RPCProviders.alchemy]) {
  //   throw new Error(`You must set infura/alchemy token provider in environment variable`)
  // }

  // //Manual provider
  // if (provider === RPCProviders.infura && RPCProvidersENV[RPCProviders.infura])
  //   return getInfuraRPCUrl(chainId)

  // if (provider === RPCProviders.alchemy && RPCProvidersENV[RPCProviders.alchemy])
  //   return getAlchemyRPCUrl(chainId)

  // // Automagic provider
  // if (RPCProvidersENV[RPCProviders.infura]) return getInfuraRPCUrl(chainId)
  // if (RPCProvidersENV[RPCProviders.alchemy]) return getAlchemyRPCUrl(chainId)
  ///////////////////////////////////////////////////////////////////////////////////////

  if (chainId === Chains.mainnet) return RPC_MAINNET
  if (chainId === Chains.goerli) return RPC_GOERLI
  if (chainId === Chains.gnosis) return RPC_GNOSIS

  throw Error('Token provider could not be found')
}

export const mainnet = () => {
  return new JsonRpcProvider(chainsConfig[Chains.mainnet].rpcUrl, Chains.mainnet)
}
export const goerli = () => {
  return new JsonRpcProvider(chainsConfig[Chains.goerli].rpcUrl, Chains.goerli)
}
export const gnosis = () => {
  return new JsonRpcProvider(chainsConfig[Chains.gnosis].rpcUrl, Chains.gnosis)
}
