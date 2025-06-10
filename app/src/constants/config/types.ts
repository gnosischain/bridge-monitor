import { ObjectValues } from '@/types/utils'

export const Chains = {
  mainnet: 1,
  //chiado: 10200,
  gnosis: 100,
} as const

export type ChainConfig = {
  id: ChainsValues
  name: string
  shortName: string
  chainId: ChainsValues
  chainIdHex: string
  rpcUrl: string
  blockExplorerUrls: string[]
  token: string
  tokenDecimals: number
  blocksFrequencyInSeconds: number
  blockExplorerName: string
  bridge: {
    DAI: string
    wForeignNative: string
    USDS?: string
  }
}

export type ChainsValues = ObjectValues<typeof Chains>
export type ChainsKeys = keyof typeof Chains

type BaseAppContractInfo = {
  abi: Array<unknown>
  decimals?: number
  icon?: JSX.Element
  symbol?: string
  priceTokenId?: string
}

export type ChainAppContractInfo = BaseAppContractInfo & {
  address: string
}

export type AppContractInfo = BaseAppContractInfo & {
  address: { [key in ChainsValues]: string }
}

/**
 * @dev Here you can add the list of tokens you want to use in the app
 * The list follow the standard from: https://tokenlists.org/
 */
export const TokensLists = {
  // '1INCH': 'https://gateway.ipfs.io/ipns/tokens.1inch.eth',
  COINGECKO: 'https://tokens.coingecko.com/uniswap/all.json',
  // OPTIMISM: 'https://static.optimism.io/optimism.tokenlist.json',
  // BLOCKSCOUT: 'https://blockscout.com/xdai/mainnet/api?module=token&action=bridgedTokenList',
} as const
