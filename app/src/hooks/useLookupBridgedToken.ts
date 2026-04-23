import { TokenInfo as UniswapToken } from '@/types/token'
import { useMemo } from 'react'
import { useReadContracts } from 'wagmi'

import { Chains } from '@/src/constants/config/chains'
import { NATIVE_TOKEN_ADDRESS } from '@/src/constants/config/common'
import { useDaiToken } from '@/src/hooks/useDaiToken'
import { useBridgedTokens } from '@/src/providers/tokenListProvider'
import { formatNumber } from '@/src/utils/format'
import { isSameString } from '@/src/utils/tools'
import { erc20Abi, formatUnits, zeroAddress } from 'viem'

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
  tokenValue: string
}) => {
  const { gnosisXdaiToken, mainnetDaiToken } = useDaiToken()
  const { tokenList, tokensByAddress } = useBridgedTokens()

  const isMainnetToken = initiatorNetwork === 'mainnet'
  const normalizedAddress = tokenAddress?.toLowerCase()
  const isXdaiBridge = (bridgeName ?? '').toUpperCase() === 'XDAI'
  const isNativeAddress =
    normalizedAddress === zeroAddress || isSameString(normalizedAddress, NATIVE_TOKEN_ADDRESS)
  const isNativeInXdaiBridge = isXdaiBridge && isNativeAddress
  const xDaiBridgedToken = isNativeInXdaiBridge ? mainnetDaiToken : gnosisXdaiToken

  const tokenFromList =
    tokensByAddress[normalizedAddress] ??
    tokenList.find(({ address }) => isSameString(address, normalizedAddress))

  const chainId = isMainnetToken ? Chains.mainnet : Chains.gnosis
  const shouldFetchFromChain =
    !isXdaiBridge && !isNativeAddress && !tokenFromList && !!normalizedAddress

  const erc20Contract = {
    address: normalizedAddress as `0x${string}`,
    abi: erc20Abi,
    chainId,
  } as const

  const { data: contractData } = useReadContracts({
    contracts: [
      { ...erc20Contract, functionName: 'name' },
      { ...erc20Contract, functionName: 'symbol' },
      { ...erc20Contract, functionName: 'decimals' },
    ],
    query: { enabled: shouldFetchFromChain, staleTime: Infinity },
  })

  const token = useMemo((): UniswapToken | undefined => {
    if (isNativeInXdaiBridge) return gnosisXdaiToken
    if (tokenFromList) return tokenFromList
    if (!contractData) return undefined
    const [name, symbol, decimals] = contractData
    if (name.status === 'failure' || symbol.status === 'failure' || decimals.status === 'failure') {
      return undefined
    }
    return {
      address: normalizedAddress,
      chainId,
      name: name.result,
      symbol: symbol.result,
      decimals: decimals.result,
      logoURI: tokenList.find((t) => isSameString(t.symbol, symbol.result))?.logoURI,
    }
  }, [
    isNativeInXdaiBridge,
    gnosisXdaiToken,
    tokenFromList,
    contractData,
    normalizedAddress,
    chainId,
    tokenList,
  ])

  const defaultToken: UniswapToken = useMemo(
    () => ({
      name: normalizedAddress,
      symbol: normalizedAddress,
      decimals: 0,
      address: normalizedAddress,
      chainId: isMainnetToken ? 1 : 100,
    }),
    [isMainnetToken, normalizedAddress],
  )

  const value = useMemo(
    () =>
      token && tokenValue
        ? formatNumber(parseFloat(formatUnits(BigInt(tokenValue), token.decimals)))
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
