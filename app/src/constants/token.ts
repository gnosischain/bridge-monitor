import { contracts } from './config/contracts'
import { Chains } from './config/types'

import { getIcon } from '@/src/utils/icons'

export type Token = {
  address: string
  chainId: number
  decimals: number
  logoURI?: string
  name: string
  symbol: string
  native?: boolean
}
export type TokenListResponse = {
  keywords: string[]
  logoURI: string
  name: string
  tags: unknown
  timestamp: string
  tokens: Token[]
  version: { major: number; minor: number; patch: number }
}

// @todo think a better way to handle {token => info} (missing network...)
export const tokens: Record<'DAI' | 'XDAI' | 'GNO' | 'GNO_GC' | 'INCH', Token> = {
  DAI: {
    address: contracts.DAI.address[Chains.mainnet],
    chainId: Chains.mainnet,
    decimals: 18,
    logoURI: getIcon('dai'),
    name: 'DAI',
    symbol: 'DAI',
    native: false,
  },
  XDAI: {
    address: '', // @todo as it is a native token, it does not have an address associated
    chainId: Chains.gnosis,
    decimals: 18,
    logoURI: getIcon('xdai'),
    name: 'xDAI',
    symbol: 'xDAI',
    native: true,
  },
  GNO: {
    address: contracts.GNO.address[Chains.mainnet],
    chainId: Chains.mainnet,
    decimals: 18,
    logoURI:
      'https://assets.coingecko.com/coins/images/662/thumb/logo_square_simple_300px.png?1609402668',
    name: 'Gnosis',
    symbol: 'GNO',
    native: false,
  },
  GNO_GC: {
    address: contracts.GNO.address[Chains.gnosis],
    chainId: Chains.gnosis,
    decimals: 18,
    logoURI:
      'https://assets.coingecko.com/coins/images/662/thumb/logo_square_simple_300px.png?1609402668',
    name: 'Gnosis',
    symbol: 'GNO',
    native: false,
  },
  INCH: {
    address: contracts.INCH.address[Chains.mainnet],
    chainId: Chains.mainnet,
    decimals: 18,
    logoURI: getIcon('1inch'),
    name: 'OneInch',
    symbol: '1INCH',
    native: false,
  },
} as const
