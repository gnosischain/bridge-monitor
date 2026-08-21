import { FC, PropsWithChildren, createContext, useContext } from 'react'
import useSWR from 'swr/immutable'
import groupBy from 'lodash/groupBy'
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
import { zeroAddress } from 'viem'

type TokenListQueryReturn = {
  tokenList: Array<Token>
  tokensByAddress: TokensByAddress
  tokensByNetwork: TokensByNetwork
  nativeTokensByNetwork: NativeTokensByNetwork
  ambTokensByNetwork: TokensByNetwork
}

const fetchBridgedTokens = async (): Promise<Array<Token>> =>
  fetch('/api/tokens').then((response) => response.json())

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
      const foreignTokenAddress = token.extensions.bridgeInfo[1]?.tokenAddress
      if (!foreignTokenAddress) throw new Error('Foreign token address not found')

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
 * @returns An object containing the list of tokens, indexed by address, and network.
 */
const useTokenListQuery = () => {
  return useSWR(['token-list'], async (): Promise<TokenListQueryReturn> => {
    // fetch all token from the constant TokenLists
    const tokenListPromises = Object.values(TokensLists).map(async (url) => fetch(url))

    // filter out the promises that are not fulfilled
    const fulfilledResults = await Promise.allSettled(tokenListPromises).then((results) =>
      results.filter(isFulfilled),
    )

    // fetch all token lists
    const tokenLists: TokenListResponse[] = await Promise.all(
      fulfilledResults.map((fulfilledResult) => {
        if (fulfilledResult.value.ok) {
          return fulfilledResult.value.json()
        }

        return Promise.resolve({ tokens: [] })
      }),
    )

    // Unify all tokens from all token lists
    const tokenList = tokenLists.flatMap((tokenList) => tokenList.tokens)
    const addLogoUri = addLogoUriByTokenList(tokenList)

    // fetch tokens from the bridge
    const bridgedTokens = await fetchBridgedTokens()

    const tokens = bridgedTokens.map((token) =>
      addLogoUri(removeSpecialCharactersInName(lowerCaseAddresses(token))),
    )

    const isBridgedToNative = (token: Token) =>
      isNativeToken(
        (token.extensions.bridgeInfo[1]?.tokenAddress ??
          token.extensions.bridgeInfo[100]?.tokenAddress) ||
          zeroAddress,
      )

    return {
      tokenList,
      tokensByAddress: Object.fromEntries(tokens.map((token) => [token.address, token] as const)),
      tokensByNetwork: groupBy(tokens, 'chainId'),
      ambTokensByNetwork: groupBy(
        tokens.filter((token) => !isBridgedToNative(token)),
        'chainId',
      ),
      nativeTokensByNetwork: Object.fromEntries(
        tokens
          .filter((token) => isNativeToken(token.address))
          .map((token) => [token.chainId, token] as const),
      ),
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
  const context = useContext(TokenListContext)
  if (context === undefined) {
    throw new Error('useBridgedTokens must be used within a TokenListProvider')
  }
  return useContext<TokenListQueryReturn>(TokenListContext)
}
