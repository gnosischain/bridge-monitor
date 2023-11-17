import { JsonRpcProvider } from '@ethersproject/providers'
import { TokenInfo as UniswapToken } from '@uniswap/token-lists'
import { BigNumber, BigNumberish, FixedNumber, constants } from 'ethers'
import memoize from 'lodash/memoize'
import { useEffect, useState } from 'react'

import { Chains, getNetworkConfig } from '@/src/constants/config/chains'
import { useDaiToken } from '@/src/hooks/useDaiToken'
import { useBridgedTokens } from '@/src/providers/TokenListProvider'
import { formatNumber } from '@/src/utils/format'
import { isSameString } from '@/src/utils/tools'
import { ERC20__factory } from '@/types/typechain'

const lookupToken = memoize(
  async (tokenAddress: string, isMainnetToken: boolean, tokenList: Array<UniswapToken>) => {
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

  const [token, setToken] = useState<UniswapToken | undefined>(() =>
    isNativeInXdaiBridge
      ? gnosisXdaiToken
      : tokensByAddress[tokenAddress] ??
        tokenList.find(({ address }) => isSameString(address, tokenAddress)),
  )

  const xDaiBridgedToken = isNativeInXdaiBridge ? mainnetDaiToken : gnosisXdaiToken

  useEffect(() => {
    if (!token && !isXdaiBridge && !isZeroToken) {
      lookupToken(tokenAddress, isMainnetToken, tokenList)
        .then(setToken)
        .catch((error) => {
          // fail silently
          console.error('Error looking up token', error)
        })
    }
  }, [isMainnetToken, isXdaiBridge, isZeroToken, token, tokenAddress, tokenList])

  const defaultToken: UniswapToken = {
    name: tokenAddress,
    symbol: tokenAddress,
    decimals: 0,
    address: tokenAddress,
    chainId: isMainnetToken ? 1 : 100,
  }

  const value = token
    ? formatNumber(
        +FixedNumber.fromValue(BigNumber.from(tokenValue), token.decimals).round(4).toString(),
      )
    : tokenValue.toString()

  return {
    initiatorToken: token ?? defaultToken,
    destinationToken: xDaiBridgedToken,
    isXdaiBridge,
    value,
  }
}
