import type { TokenInfo, TokenList } from '@uniswap/token-lists'

export type Token = Omit<TokenInfo, 'extensions'> & {
  extensions: {
    bridgeInfo: Partial<{
      [key in 1 | 100]: {
        tokenAddress: string
      }
    }>
  }
}

export type TokenListResponse = Omit<TokenList, 'tokens'> & {
  tokens: Array<Token>
}

export type TokensByAddress = { [address: string]: Token }
export type TokensByNetwork = { [networkId: number]: Array<Token> }
export type NativeTokensByNetwork = { [networkId: number]: Token }

export function isTokenTuple(tokens: [Token | null, Token | null]): tokens is [Token, Token] {
  return tokens.every((token) => token !== null)
}
