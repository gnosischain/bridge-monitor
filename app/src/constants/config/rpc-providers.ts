import { RPC_GNOSIS, RPC_MAINNET } from './common'
import { Chains, ChainsValues } from '@/src/constants/config/types'

export const getProviderUrl = (chainId: ChainsValues) => {
  switch (chainId) {
    case Chains.mainnet:
      return RPC_MAINNET
    case Chains.gnosis:
      return RPC_GNOSIS
    default:
      throw Error('Token provider could not be found')
  }
}
