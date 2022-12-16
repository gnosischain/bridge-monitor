import { Address } from '@web3-onboard/core/dist/types'

import { contracts } from './config/contracts'
import { Chains } from './config/types'

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
export const tokens: Record<'DAI' | 'XDAI', Token> = {
  DAI: {
    address: contracts['DAI'].address[Chains.mainnet],
    chainId: Chains.mainnet,
    decimals: 18,
    logoURI: '/images/icons/dai.png',
    name: 'DAI',
    symbol: 'DAI',
    native: false,
  },
  XDAI: {
    address: '', // @todo as it is a native token, it does not have an address associated
    chainId: Chains.xdai,
    decimals: 18,
    logoURI: '/images/icons/xdai.png',
    name: 'xDAI',
    symbol: 'xDAI',
    native: true,
  },
} as const
