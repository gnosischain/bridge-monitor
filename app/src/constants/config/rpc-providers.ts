import { Chains, ChainsValues } from '@/src/constants/config/types'

/**
 * Same-origin proxy path for all browser RPC traffic. The upstream provider URLs
 * (e.g. the Tenderly mainnet gateway, whose URL embeds an access key) live
 * server-side in `pages/api/rpc.ts` and never reach the client bundle.
 */
export const RPC_PROXY_PATH = '/api/rpc'

/**
 * Absolute base for {@link RPC_PROXY_PATH}. viem's own `fetch` is happy with a relative URL, but
 * wagmi forwards the transport URL to WalletConnect (`extractRpcUrls` → `EthereumProvider`'s
 * `rpcMap`), and `@walletconnect/jsonrpc-http-connection` rejects any URL without an `http(s):`
 * protocol — "Provided URL is not compatible with HTTP connection". So the browser needs the origin
 * spelled out or every WalletConnect RPC call fails. Read from the live origin rather than a
 * build-time env so preview deploys and localhost proxy to themselves instead of production; the
 * server has no origin and issues no RPC of its own, so a relative path is fine there.
 */
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
