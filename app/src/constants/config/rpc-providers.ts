import { Chains, ChainsValues } from '@/src/constants/config/types'

/**
 * Same-origin proxy path for all browser RPC traffic. The upstream provider URLs
 * (e.g. the Tenderly mainnet gateway, whose URL embeds an access key) live
 * server-side in `pages/api/rpc.ts` and never reach the client bundle.
 */
export const RPC_PROXY_PATH = '/api/rpc'

const getProxyBaseUrl = () => (typeof window === 'undefined' ? '' : window.location.origin)

export const getProviderUrl = (chainId: ChainsValues) => {
  switch (chainId) {
    case Chains.mainnet:
    case Chains.gnosis:
      return `${getProxyBaseUrl()}${RPC_PROXY_PATH}?chainId=${chainId}`
    default:
      throw Error('Token provider could not be found')
  }
}
