import { JsonRpcProvider } from '@ethersproject/providers'
import { TokenInfo as UniswapToken } from '@uniswap/token-lists'
import { BigNumber, BigNumberish, FixedNumber, constants } from 'ethers'
import memoize from 'lodash/memoize'
import { useEffect, useMemo, useState } from 'react'

import { Chains, getNetworkConfig } from '@/src/constants/config/chains'
import { useDaiToken } from '@/src/hooks/useDaiToken'
import { useBridgedTokens } from '@/src/providers/tokenListProvider'
import { formatNumber } from '@/src/utils/format'
import { isSameString } from '@/src/utils/tools'
import { ERC20__factory } from '@/types/typechain'

const lookupToken = memoize(
  async (tokenAddress: string, isMainnetToken: boolean, tokenList: Array<UniswapToken>) => {
    // First, try to find the token in the provided tokenList
    const tokenData = tokenList.find(
      (token) => token.address.toLowerCase() === tokenAddress.toLowerCase(),
    )

    if (tokenData) {
      return {
        address: tokenAddress,
        chainId: isMainnetToken ? 1 : 100,
        decimals: tokenData.decimals,
        name: tokenData.name,
        symbol: tokenData.symbol,
        logoURI: tokenData.logoURI,
      }
    }

    // console.log('token not found in the token list', tokenAddress)

    const readOnlyProvider = new JsonRpcProvider(
      getNetworkConfig(Chains[isMainnetToken ? 'mainnet' : 'gnosis']).rpcUrl,
      Chains[isMainnetToken ? 'mainnet' : 'gnosis'],
    )
    const tokenInstance = ERC20__factory.connect(tokenAddress, readOnlyProvider)

    const [name, symbol, decimals] = await Promise.all([
      tokenInstance.name(),
      tokenInstance.symbol(),
      tokenInstance.decimals(),
    ])

    return {
      address: tokenAddress,
      chainId: isMainnetToken ? 1 : 100,
      decimals,
      name,
      symbol,
      logoURI: tokenList.find((token) => isSameString(token.symbol, symbol))?.logoURI,
    }
  },
)

/**
 * Returns a pair of tokens (initiator and destination), along with the value bridged and bridge information
 *
 * @dev It will first search for the token info in the list of tokens provided by TokenListProvider, if no data is found,
 * it looks for the info in the blockchain by querying the ERC20 tokens
 */
export const useLookupBridgedToken = ({
  bridgeName,
  initiatorNetwork,
  tokenAddress,
  tokenValue,
}: {
  bridgeName: string
  initiatorNetwork: string
  tokenAddress: string
  tokenValue: BigNumberish
}) => {
  const { gnosisXdaiToken, mainnetDaiToken } = useDaiToken()
  const { tokenList, tokensByAddress } = useBridgedTokens()

  const isMainnetToken = initiatorNetwork === 'mainnet'
  tokenAddress = tokenAddress?.toLowerCase()
  const isXdaiBridge = bridgeName === 'XDAI'
  const isZeroToken = tokenAddress === constants.AddressZero
  const isNativeInXdaiBridge = isXdaiBridge && isZeroToken
  const [token, setToken] = useState<UniswapToken | undefined>()
  const xDaiBridgedToken = isNativeInXdaiBridge ? mainnetDaiToken : gnosisXdaiToken

  useEffect(() => {
    // have to check if the component is still mounted before setting the state
    let isMounted = true

    if (!isXdaiBridge && !isZeroToken) {
      lookupToken(tokenAddress, isMainnetToken, tokenList)
        .then((data) => {
          if (isMounted) {
            setToken(data)
          }
        })
        .catch((error) => {
          // fail silently
          console.error('Error looking up token', error)
        })

      return () => {
        isMounted = false
      }
    } else {
      setToken(
        isNativeInXdaiBridge
          ? gnosisXdaiToken
          : tokenAddress
          ? tokensByAddress[tokenAddress] ??
            tokenList.find(({ address }) => isSameString(address, tokenAddress))
          : undefined,
      )
    }
  }, [
    gnosisXdaiToken,
    isMainnetToken,
    isNativeInXdaiBridge,
    isXdaiBridge,
    isZeroToken,
    tokenAddress,
    tokenList,
    tokensByAddress,
  ])

  const defaultToken: UniswapToken = useMemo(() => {
    return {
      name: tokenAddress,
      symbol: tokenAddress,
      decimals: 0,
      address: tokenAddress,
      chainId: isMainnetToken ? 1 : 100,
    }
  }, [isMainnetToken, tokenAddress])

  const value = useMemo(
    () =>
      token && tokenValue
        ? formatNumber(
            +FixedNumber.fromValue(BigNumber.from(tokenValue), token.decimals).round(4).toString(),
          )
        : '',
    [token, tokenValue],
  )
  const initiatorToken = useMemo(() => token ?? defaultToken, [defaultToken, token])

  return {
    initiatorToken,
    destinationToken: xDaiBridgedToken,
    isXdaiBridge,
    value,
    isLoading: !initiatorToken || !value,
  }
}
