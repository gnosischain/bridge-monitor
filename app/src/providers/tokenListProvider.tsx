import { FC, PropsWithChildren, createContext, useContext } from 'react'
import useSWR from 'swr/immutable'
import { TokensLists } from '@/src/constants/config/types'
import { getIcon } from '@/src/utils/icons'
import { isNativeToken, isSameString } from '@/src/utils/tools'
import {
  NativeTokensByNetwork,
  Token,
  TokenListResponse,
  TokensByAddress,
  TokensByNetwork,
} from '@/types/token'
import { isFulfilled } from '@/types/utils'

type TokenListQueryReturn = {
  tokens: Array<Token>
  tokenList: Array<Token>
  tokensByAddress: TokensByAddress
  tokensByNetwork: TokensByNetwork
  nativeTokensByNetwork: NativeTokensByNetwork
  ambTokensByNetwork: TokensByNetwork
}

const fetchBridgedTokens = async (): Promise<Array<Token>> =>
  fetch('/api/tokens').then((response) => response.json())

const baseTokensInfo: TokenListQueryReturn = {
  tokens: [],
  tokenList: [],
  tokensByAddress: {},
  tokensByNetwork: {},
  nativeTokensByNetwork: {},
  ambTokensByNetwork: {},
}

const addLogoUriByTokenList = (tokenList: Token[]) => (token: Token) => {
  if (isNativeToken(token.address)) {
    const logoURI = token.chainId === 1 ? getIcon('eth') : getIcon('xdai')
    return {
      ...token,
      logoURI,
    }
  }

  // if the token has no logoURI, look for it in the token list
  if (!token.logoURI) {
    // if the chain is gnosis, look for the token in the token list of the foreign chain
    if (token.chainId === 100) {
      const foreignTokenAddress = token.extensions.bridgeInfo[1].tokenAddress

      const logoUriFromTokenList = tokenList.find(({ address }) =>
        isSameString(address, foreignTokenAddress),
      )?.logoURI

      if (logoUriFromTokenList) {
        return {
          ...token,
          logoURI: logoUriFromTokenList,
        }
      }
    }

    // if on the foreign chain, look for the token in the token list
    const logoUriFromTokenList = tokenList.find(({ address }) =>
      isSameString(address, token.address),
    )?.logoURI

    if (logoUriFromTokenList) {
      return {
        ...token,
        logoURI: logoUriFromTokenList,
      }
    }
  }

  return token
}

const lowerCaseAddresses = (token: Token) => ({
  ...token,
  address: token.address.toLowerCase(),
  extensions: {
    ...token.extensions,
    bridgeInfo: Object.fromEntries(
      Object.entries(token.extensions.bridgeInfo).map(([chainId, bridgeInfo]) => [
        chainId,
        { ...bridgeInfo, tokenAddress: bridgeInfo.tokenAddress.toLowerCase() },
      ]),
    ) as Token['extensions']['bridgeInfo'],
  },
})

const removeSpecialCharactersInName = (token: Token) => ({
  ...token,
  // this one goes for USD//C
  name: token.name.replace('//', ''),
})

/**
 * Custom hook that fetches and returns a list of tokens from various sources.
 * @returns An object containing the list of tokens, indexed by address, symbol, and network.
 */
const useTokenListQuery = () => {
  return useSWR(['token-list'], async () => {
    const tokenListPromises = Object.values(TokensLists).map(async (url) => fetch(url))

    const fulfilledResults = await Promise.allSettled(tokenListPromises).then((results) =>
      results.filter(isFulfilled),
    )
    const tokenLists: TokenListResponse[] = await Promise.all(
      fulfilledResults.map((fulfilledResult) => {
        if (fulfilledResult.value.ok) {
          return fulfilledResult.value.json()
        }

        return Promise.resolve({ tokens: [] })
      }),
    )
    const tokenList = tokenLists.flatMap((tokenList) => tokenList.tokens)

    const bridgedTokens = await fetchBridgedTokens()
    const addLogoUri = addLogoUriByTokenList(tokenList)

    return {
      ...bridgedTokens.reduce((acc: TokenListQueryReturn, token: Token) => {
        token = addLogoUri(removeSpecialCharactersInName(lowerCaseAddresses(token)))

        // native tokens indexing
        if (isNativeToken(token.address)) {
          acc.nativeTokensByNetwork[token.chainId] = token
        }

        acc.tokens.concat(token)
        acc.tokensByAddress[token.address] = token
        acc.tokensByNetwork[token.chainId] = (acc.tokensByNetwork[token.chainId] ?? []).concat(
          token,
        )

        const isBridgedToNative = isNativeToken(
          token.extensions.bridgeInfo[1]?.tokenAddress ??
            token.extensions.bridgeInfo[100]?.tokenAddress,
        )

        if (!isBridgedToNative) {
          acc.ambTokensByNetwork[token.chainId] = (
            acc.ambTokensByNetwork[token.chainId] ?? []
          ).concat(token)
        }

        return acc
      }, baseTokensInfo),
      tokenList,
    }
  })
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const TokenListContext = createContext<TokenListQueryReturn>({} as any)

export const TokenListProvider: FC<PropsWithChildren<unknown>> = ({ children }) => {
  const { data } = useTokenListQuery()

  return data ? (
    <TokenListContext.Provider value={data}>{children}</TokenListContext.Provider>
  ) : null
}

export default TokenListProvider

export function useBridgedTokens(): TokenListQueryReturn {
  return useContext<TokenListQueryReturn>(TokenListContext)
}
