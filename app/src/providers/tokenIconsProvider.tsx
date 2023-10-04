import { FC, PropsWithChildren, createContext, useContext } from 'react'

import { TokenInfo } from '@uniswap/token-lists'
import useSWR from 'swr'

import gnosisChainTokensURL from '@/src/providers/token-list.json'
import { withGenericSuspense } from '@/src/components/helpers/SafeSuspense'
import { TokensLists } from '@/src/constants/config/types'
import {
  Token,
  TokenListResponse,
  TokensByAddress,
  TokensByNetwork,
  TokensBySymbol,
} from '@/types/token'
import { isFulfilled } from '@/types/utils'

type ForeignTokenListQueryReturn = {
  tokens: Token[]
  tokensByAddress: TokensByAddress
  tokensBySymbol: TokensBySymbol
  tokensByNetwork: TokensByNetwork
}
type TokenListQueryReturn = {
  tokens: Token[]
  tokensByAddress: TokensByAddress
  tokensBySymbol: TokensBySymbol
  tokensByNetwork: TokensByNetwork
}

const fetchGnosisChainTokens = async () => gnosisChainTokensURL

const useTokenListQuery = () => {
  return useSWR(['token-list'], async () => {
    const tokenListPromises = Object.values(TokensLists).map(async (url) => fetch(url))

    const fulfilledResults = await Promise.allSettled(tokenListPromises).then((results) =>
      results.filter(isFulfilled),
    )
    const tokenLists: TokenListResponse[] = await Promise.all(
      fulfilledResults.map((fulfilledResult) => {
        if (!fulfilledResult.value.ok) {
          return Promise.resolve({ tokens: [] })
        }
        return fulfilledResult.value.json()
      }),
    )
    const tokenList = tokenLists.flatMap((tokenList) => tokenList.tokens)

    const gnosisTokenList = await fetchGnosisChainTokens()

    /**
     * Custom hook that fetches and returns a list of tokens from various sources.
     * @returns An object containing the list of tokens, indexed by address, symbol, and network.
     */
    const remoteTokensInfo = tokenList.reduce(
      (acc: ForeignTokenListQueryReturn, token: TokenInfo) => {
        const address = token.address.toLowerCase()

        if (acc.tokensByAddress[address] || token.chainId !== 1) {
          return acc
        }

        acc.tokens.push(token)
        acc.tokensByAddress[address] = token
        acc.tokensBySymbol[token.symbol.toUpperCase()] = token

        if (!acc.tokensByNetwork[token.chainId]) {
          acc.tokensByNetwork[token.chainId] = [token]
        } else {
          acc.tokensByNetwork[token.chainId].push(token)
        }

        return acc
      },
      {
        tokens: [],
        tokensByAddress: {},
        tokensBySymbol: {},
        tokensByNetwork: {},
      },
    )

    /**
     * Extend the previous list with the tokens from the Gnosis chain.
     * We try to find the corresponding token in the previous list, if we find it , we add it to the lists
     * using the gnosis token address and the previous token info.
     * @returns An object containing the list of tokens, indexed by address, symbol, and network.
     */
    const finalTokens = gnosisTokenList
      .filter((gt) => gt.foreignChainId == '1')
      .reduce((acc, gnosisToken) => {
        if (!acc) {
          return acc
        }
        if (!acc) {
          return acc
        }
        const currentToken = acc.tokensBySymbol[gnosisToken.homeSymbol.toUpperCase()]
        // if no token found, skip
        if (!currentToken) {
          return acc
        }

        const gnosisTokenAddress = gnosisToken.homeContractAddressHash.toLowerCase()
        // if we already have this token, skip
        if (acc.tokensByAddress[gnosisTokenAddress]) {
          return acc
        }

        // add gnosis token to the list
        const token: TokenInfo = {
          ...currentToken,
          chainId: 100,
          address: gnosisTokenAddress,
        }
        acc.tokens.push(token)
        acc.tokensByAddress[token.address] = token
        acc.tokensBySymbol[token.symbol.toLowerCase()] = token
        acc.tokensByNetwork[token.chainId] = acc.tokensByNetwork[token.chainId]
          ? [...acc.tokensByNetwork[token.chainId], token]
          : [token]

        return acc
      }, remoteTokensInfo)

    return finalTokens
  })
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const TokenIconsContext = createContext<TokenListQueryReturn>({} as any)

export const TokenIconsContextProvider: FC<PropsWithChildren<any>> = withGenericSuspense(
  ({ children }) => {
    const { data } = useTokenListQuery()

    return !data ? null : (
      <TokenIconsContext.Provider value={data}>{children}</TokenIconsContext.Provider>
    )
  },
)

export default withGenericSuspense(TokenIconsContextProvider)

export function useTokenIcons(): TokenListQueryReturn {
  return useContext<TokenListQueryReturn>(TokenIconsContext)
}
