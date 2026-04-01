import { createPublicClient, http } from 'viem'
import { gnosis } from 'viem/chains'

import { Chains, ChainsValues } from '@/src/constants/config/types'

if (!process.env.NEXT_PUBLIC_RPC_MAINNET || !process.env.NEXT_PUBLIC_RPC_GNOSIS) {
  throw new Error('Missing RPC_MAINNET or RPC_GNOSIS environment variable')
}

export const getProviderUrl = (chainId: ChainsValues) => {
  switch (chainId) {
    case Chains.mainnet:
      return process.env.NEXT_PUBLIC_RPC_MAINNET!
    case Chains.gnosis:
      return process.env.NEXT_PUBLIC_RPC_GNOSIS!
    default:
      throw Error('Token provider could not be found')
  }
}

export const gnosisBatchClient = createPublicClient({
  chain: gnosis,
  transport: http(process.env.NEXT_PUBLIC_RPC_GNOSIS, {
    batch: true,
  }),
})
