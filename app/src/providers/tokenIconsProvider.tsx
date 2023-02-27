import { FC, PropsWithChildren, createContext, useContext } from 'react'

import { TokenInfo } from '@uniswap/token-lists'
import useSWR from 'swr'

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
  gnosisTokens: Token[]
  gnosisTokensByAddress: TokensByAddress
  gnosisTokensBySymbol: TokensBySymbol
  gnosisTokensByNetwork: TokensByNetwork
}
type GnosisTokenInfo = {
  foreignChainId: string
  foreignTokenContractAddressHash: string
  homeContractAddressHash: string
  homeDecimals: string
  homeHolderCount: string
  homeName: string
  homeSymbol: string
  homeTotalSupply: string
  homeUsdValue: string
}
type GnosisTokenListQueryReturn = {
  gnosisTokens: Token[]
  gnosisTokensByAddress: TokensByAddress
  gnosisTokensBySymbol: TokensBySymbol
  gnosisTokensByNetwork: TokensByNetwork
}

const fetchGnosisChainTokens = async () => {
  const gnosischainTokensURL =
    'https://blockscout.com/xdai/mainnet/api?module=token&action=bridgedTokenList&chainid=1&offset=600'
  // const xdaiTokenListCall = await fetch(GNOSISCHAIN_TOKENLIST_URL)
  const tokenListResponse = await fetch(gnosischainTokensURL)
  const tokenList = await tokenListResponse.json()
  return tokenList.result
}

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

    const { tokens, tokensByAddress, tokensByNetwork, tokensBySymbol } = tokenList.reduce(
      (acc: ForeignTokenListQueryReturn, token: TokenInfo) => {
        const address = token.address.toLowerCase()

        if (acc.tokensByAddress[address] || token.chainId !== 1) {
          return acc
        }

        acc.tokens.push(token)
        acc.tokensByAddress[address] = token
        acc.tokensBySymbol[token.symbol.toLowerCase()] = token

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

    const { gnosisTokens, gnosisTokensByAddress, gnosisTokensByNetwork, gnosisTokensBySymbol } =
      gnosisTokenList.reduce(
        (acc: GnosisTokenListQueryReturn, gnosisToken: GnosisTokenInfo) => {
          const address = gnosisToken.foreignTokenContractAddressHash.toLowerCase()

          if (acc.gnosisTokensByAddress[address] || gnosisToken.foreignChainId !== '1') {
            return acc
          }
          // fetch gnosisToken from tokenByAddress dic
          const cherryPickToken = tokensByAddress[address]
          if (!cherryPickToken) return acc
          // use same values, just override
          // * address
          // * chaindId
          const token: TokenInfo = {
            ...cherryPickToken,
            chainId: 100,
            address: gnosisToken.homeContractAddressHash,
          }
          // store normalized gnosisToken
          acc.gnosisTokens.push(token)
          acc.gnosisTokensByAddress[address] = token
          acc.gnosisTokensBySymbol[token.symbol.toLowerCase()] = token

          if (!acc.gnosisTokensByNetwork[token.chainId]) {
            acc.gnosisTokensByNetwork[token.chainId] = [token]
          } else {
            acc.gnosisTokensByNetwork[token.chainId].push(token)
          }

          return acc
        },
        {
          gnosisTokens: [],
          gnosisTokensByAddress: {},
          gnosisTokensByNetwork: {},
          gnosisTokensBySymbol: {},
        },
      )
    // include GNOSIS TOKENS
    return {
      tokens: tokens.sort((a, b) => a.symbol.localeCompare(b.symbol)),
      gnosisTokens: gnosisTokens.sort((a: TokenInfo, b: TokenInfo) =>
        a.symbol.localeCompare(b.symbol),
      ),
      tokensByAddress,
      gnosisTokensByAddress,
      tokensBySymbol,
      gnosisTokensBySymbol,
      tokensByNetwork,
      gnosisTokensByNetwork,
    }
  })
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const TokenIconsContext = createContext<TokenListQueryReturn>({} as any)

export const TokenIconsContextProvider: FC<PropsWithChildren<any>> = ({ children }) => {
  const { data } = useTokenListQuery()

  if (!data) {
    return null
  }

  return <TokenIconsContext.Provider value={data}>{children}</TokenIconsContext.Provider>
}

export default withGenericSuspense(TokenIconsContextProvider)

export function useTokenIcons(): TokenListQueryReturn {
  return useContext<TokenListQueryReturn>(TokenIconsContext)
}
