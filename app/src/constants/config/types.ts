import { ObjectValues } from '@/types/utils'

export const Chains = {
  mainnet: 1,
  gnosis: 100,
} as const

export type ChainConfig = {
  id: ChainsValues
  name: string
  shortName: string
  chainId: ChainsValues
  chainIdHex: string
  blockExplorerUrls: string[]
  token: string
  tokenDecimals: number
  blockExplorerName: string
  requiredBlockConfirmations: number
  bridge: {
    DAI: string
    wForeignNative: string
    USDS?: string
  }
}

export type ChainsValues = ObjectValues<typeof Chains>
export type ChainsKeys = keyof typeof Chains

/**
 * @dev Here you can add the list of tokens you want to use in the app
 * The list follow the standard from: https://tokenlists.org/
 */
export const TokensLists = {
  COINGECKO: 'https://tokens.coingecko.com/uniswap/all.json',
} as const
