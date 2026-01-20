import { TokenInfo as UniswapToken } from '@/types/token'
import { useMemo } from 'react'
import { formatUnits } from 'viem'
import { useReadContracts } from 'wagmi'
import { erc20Abi } from 'viem'
import { NATIVE_TOKEN_ADDRESS } from '@/src/constants/config/common'
import { useDaiToken } from '@/src/hooks/useDaiToken'
import { useBridgedTokens } from '@/src/providers/tokenListProvider'
import { formatNumber } from '@/src/utils/format'
import { isSameString } from '@/src/utils/tools'
import { ZERO_ADDRESS } from '@/src/constants/misc'

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
  tokenValue: bigint
}) => {
  const { gnosisXdaiToken, mainnetDaiToken } = useDaiToken()
  const { tokenList, tokensByAddress } = useBridgedTokens()

  const isMainnetToken = initiatorNetwork === 'mainnet'
  const normalizedTokenAddress = tokenAddress?.toLowerCase() as `0x${string}`
  const isXdaiBridge = (bridgeName ?? '').toUpperCase() === 'XDAI'
  const isNativeAddress =
    normalizedTokenAddress === ZERO_ADDRESS ||
    isSameString(normalizedTokenAddress, NATIVE_TOKEN_ADDRESS)
  const isNativeInXdaiBridge = isXdaiBridge && isNativeAddress
  const xDaiBridgedToken = isNativeInXdaiBridge ? mainnetDaiToken : gnosisXdaiToken

  // First, try to find the token in the provided tokenList
  const tokenDataFromList = useMemo(() => {
    if (isXdaiBridge || isNativeAddress) {
      return isNativeInXdaiBridge
        ? gnosisXdaiToken
        : normalizedTokenAddress
        ? tokensByAddress[normalizedTokenAddress] ??
          tokenList.find(({ address }) => isSameString(address, normalizedTokenAddress))
        : undefined
    }
    return tokenList.find(
      (token) => token.address.toLowerCase() === normalizedTokenAddress.toLowerCase(),
    )
  }, [
    isXdaiBridge,
    isNativeAddress,
    isNativeInXdaiBridge,
    gnosisXdaiToken,
    normalizedTokenAddress,
    tokensByAddress,
    tokenList,
  ])

  // Fetch token data from blockchain if not found in list
  const { data: contractData } = useReadContracts({
    contracts: [
      {
        address: normalizedTokenAddress,
        abi: erc20Abi,
        functionName: 'name',
        chainId: isMainnetToken ? 1 : 100,
      },
      {
        address: normalizedTokenAddress,
        abi: erc20Abi,
        functionName: 'symbol',
        chainId: isMainnetToken ? 1 : 100,
      },
      {
        address: normalizedTokenAddress,
        abi: erc20Abi,
        functionName: 'decimals',
        chainId: isMainnetToken ? 1 : 100,
      },
    ],
    query: {
      enabled: !tokenDataFromList && !isXdaiBridge && !isNativeAddress,
    },
  })

  const tokenFromContract = useMemo(() => {
    if (!contractData) return undefined

    const [nameResult, symbolResult, decimalsResult] = contractData

    if (
      nameResult?.status !== 'success' ||
      symbolResult?.status !== 'success' ||
      decimalsResult?.status !== 'success'
    ) {
      return undefined
    }

    return {
      address: normalizedTokenAddress,
      chainId: isMainnetToken ? 1 : 100,
      decimals: decimalsResult.result,
      name: nameResult.result,
      symbol: symbolResult.result,
      logoURI: tokenList.find((token) => isSameString(token.symbol, symbolResult.result))?.logoURI,
    }
  }, [contractData, normalizedTokenAddress, isMainnetToken, tokenList])

  const token = tokenDataFromList || tokenFromContract

  const defaultToken: UniswapToken = useMemo(() => {
    return {
      name: normalizedTokenAddress,
      symbol: normalizedTokenAddress,
      decimals: 0,
      address: normalizedTokenAddress,
      chainId: isMainnetToken ? 1 : 100,
    }
  }, [isMainnetToken, normalizedTokenAddress])

  const value = useMemo(
    () =>
      token && tokenValue ? formatNumber(Number(formatUnits(tokenValue, token.decimals))) : '',
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
