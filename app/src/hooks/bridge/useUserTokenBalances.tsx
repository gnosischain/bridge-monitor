import { MAX_UINT_256, ZERO_BN } from '@/src/constants/misc'
import { isNativeToken } from '@/src/utils/tools'
import { useBalance, useGasPrice, useReadContracts } from 'wagmi'
import { erc20Abi } from 'viem'

export const useUserTokenBalances = ({
  allowanceAddress,
  chainId,
  tokenAddress,
  userAddress,
}: {
  userAddress: string
  allowanceAddress?: string
  tokenAddress?: string
  chainId: number
}) => {
  const _isNativeToken = tokenAddress ? isNativeToken(tokenAddress) : false

  // ERC20 token balance and allowance
  const {
    data: contractData,
    error: contractError,
    isLoading: isLoadingContracts,
    refetch: refetchContracts,
  } = useReadContracts({
    contracts: [
      {
        address: tokenAddress as `0x${string}`,
        abi: erc20Abi,
        functionName: 'balanceOf',
        args: [userAddress as `0x${string}`],
        chainId,
      },
      {
        address: tokenAddress as `0x${string}`,
        abi: erc20Abi,
        functionName: 'allowance',
        args: [userAddress as `0x${string}`, allowanceAddress as `0x${string}`],
        chainId,
      },
    ],
    query: {
      enabled: !!tokenAddress && !!userAddress && !_isNativeToken,
    },
  })

  // Native token balance
  const {
    data: nativeBalance,
    error: nativeBalanceError,
    isLoading: isLoadingNativeBalance,
    refetch: refetchNative,
  } = useBalance({
    address: userAddress as `0x${string}`,
    chainId,
    query: {
      enabled: !!userAddress && _isNativeToken,
    },
  })

  // Gas price for calculating max sendable amount
  const { data: gasPrice } = useGasPrice({
    chainId,
    query: {
      enabled: _isNativeToken,
    },
  })

  if (_isNativeToken) {
    const conservativeGasLimit = 21000n
    const maxSendableAmount =
      nativeBalance?.value && gasPrice ? nativeBalance.value - conservativeGasLimit * gasPrice : 0n

    return {
      data: {
        balance: maxSendableAmount > 0n ? maxSendableAmount : ZERO_BN,
        allowance: MAX_UINT_256,
      },
      isLoading: isLoadingNativeBalance,
      error: nativeBalanceError,
      refetch: refetchNative,
    }
  }

  const balance = contractData?.[0]?.result ?? ZERO_BN
  const allowance = allowanceAddress ? contractData?.[1]?.result ?? ZERO_BN : MAX_UINT_256

  return {
    data: {
      balance,
      allowance,
    },
    isLoading: isLoadingContracts,
    error: contractError,
    refetch: refetchContracts,
  }
}
