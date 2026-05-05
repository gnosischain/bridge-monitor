import { useMemo } from 'react'
import { keepPreviousData } from '@tanstack/react-query'
import { erc20Abi } from 'viem'
import { useBalance, useGasPrice, useReadContract } from 'wagmi'

import { ChainsValues } from '@/src/constants/config/types'
import { MAX_UINT_256 } from '@/src/constants/misc'
import { isNativeToken } from '@/src/utils/tools'

export const useUserTokenBalances = ({
  allowanceAddress,
  chainId,
  tokenAddress,
  userAddress,
}: {
  userAddress: string
  chainId: ChainsValues
  allowanceAddress?: string
  tokenAddress?: string
}) => {
  const isNative = !!tokenAddress && isNativeToken(tokenAddress)
  const isErc20 = !!tokenAddress && !isNative

  const {
    data: nativeBalance,
    isLoading: isLoadingNativeBalance,
    refetch: refetchNativeBalance,
  } = useBalance({
    address: userAddress as `0x${string}`,
    chainId,
    query: { enabled: isNative && !!userAddress, placeholderData: keepPreviousData },
  })

  const {
    data: gasPrice,
    isLoading: isLoadingGasPrice,
    refetch: refetchGasPrice,
  } = useGasPrice({
    chainId,
    query: { enabled: isNative, placeholderData: keepPreviousData },
  })

  const {
    data: erc20Balance,
    isLoading: isLoadingErc20Balance,
    refetch: refetchErc20Balance,
  } = useReadContract({
    address: tokenAddress as `0x${string}`,
    abi: erc20Abi,
    functionName: 'balanceOf',
    args: [userAddress as `0x${string}`],
    chainId,
    query: { enabled: isErc20 && !!userAddress, placeholderData: keepPreviousData },
  })

  const {
    data: erc20Allowance,
    isLoading: isLoadingErc20Allowance,
    refetch: refetchErc20Allowance,
  } = useReadContract({
    address: tokenAddress as `0x${string}`,
    abi: erc20Abi,
    functionName: 'allowance',
    args: [userAddress as `0x${string}`, allowanceAddress as `0x${string}`],
    chainId,
    query: {
      enabled: isErc20 && !!userAddress && !!allowanceAddress,
      placeholderData: keepPreviousData,
    },
  })

  const data = useMemo(() => {
    if (!tokenAddress) return undefined

    if (isNative) {
      if (nativeBalance === undefined || gasPrice === undefined) return undefined
      const conservativeGasLimit = 21000n
      const maxSendableAmount = nativeBalance.value - conservativeGasLimit * gasPrice
      return {
        balance: maxSendableAmount > 0n ? maxSendableAmount : 0n,
        allowance: MAX_UINT_256,
      }
    }

    if (erc20Balance === undefined) return undefined

    if (allowanceAddress) {
      if (erc20Allowance === undefined) return undefined
      return { balance: erc20Balance, allowance: erc20Allowance }
    }

    return { balance: erc20Balance, allowance: MAX_UINT_256 }
  }, [
    tokenAddress,
    isNative,
    nativeBalance,
    gasPrice,
    erc20Balance,
    erc20Allowance,
    allowanceAddress,
  ])

  // TODO: drop `refetch` once the approval flow uses `useWaitForTransactionReceipt`
  // (wagmi auto-invalidates queries on block, making manual refetch unnecessary).
  // Currently kept because `ApproveButton` calls it after `tx.wait()` to refresh allowance.
  const refetch = async () => {
    if (isNative) {
      await refetchNativeBalance()
      await refetchGasPrice()
    } else {
      await Promise.all([refetchErc20Balance(), refetchErc20Allowance()])
    }
  }

  const isLoading =
    isLoadingNativeBalance || isLoadingGasPrice || isLoadingErc20Balance || isLoadingErc20Allowance

  return { data, refetch, isLoading }
}
