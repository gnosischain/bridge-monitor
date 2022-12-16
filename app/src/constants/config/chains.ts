import nullthrows from 'nullthrows'

import { getProviderUrl } from '@/src/constants/config/rpc-providers'
import { ChainConfig, Chains, ChainsValues } from '@/src/constants/config/types'

// Default chain id from env var
export const INITIAL_APP_CHAIN_ID = Number(
  process.env.NEXT_PUBLIC_DEFAULT_CHAIN_ID || '1',
) as ChainsValues

export const chainsConfig: Record<ChainsValues, ChainConfig> = {
  [Chains.mainnet]: {
    id: Chains.mainnet,
    name: 'Mainnet',
    shortName: 'Mainnet',
    chainId: Chains.mainnet,
    chainIdHex: '0x1',
    rpcUrl: getProviderUrl(Chains.mainnet),
    blockExplorerUrls: ['https://etherscan.io/'],
    token: 'ETH',
  },
  [Chains.goerli]: {
    id: Chains.goerli,
    name: 'Görli Testnet',
    shortName: 'Goerli',
    chainId: Chains.goerli,
    chainIdHex: '0x5',
    rpcUrl: getProviderUrl(Chains.goerli),
    blockExplorerUrls: ['https://goerli.etherscan.io/'],
    token: 'ETH',
  },
  [Chains.xdai]: {
    id: Chains.xdai,
    name: 'Gnosis Chain',
    shortName: 'Gnosis',
    chainId: Chains.xdai,
    chainIdHex: '0x64',
    rpcUrl: getProviderUrl(Chains.xdai), // @todo we might need to use the xdai rpc
    blockExplorerUrls: ['https://gnosisscan.io/'],
    token: 'xDAI',
  },
}

export function getNetworkConfig(chainId: ChainsValues): ChainConfig {
  const networkConfig = chainsConfig[chainId]
  return nullthrows(networkConfig, `No config for chain id: ${chainId}`)
}
