import { useMemo } from 'react'
import { useReadContract } from 'wagmi'
import { zeroAddress } from 'viem'

import { ChainsValues } from '@/src/constants/config/types'
import { EURCe_GNOSIS } from '@/src/constants/misc'
import { getBridgeCommonInfo } from '@/src/hooks/bridge/utils/getBridgeCommonInfo'
import { TokenOverrideManager } from '@/src/utils/token-overrides'
import { Token } from '@/types/token'
import { contracts } from '@/src/constants/config/contracts'
import { isSameString } from '@/src/utils/tools'

export type TOKEN_MODE = 'ERC20' | 'ERC677' | 'D-ERC20'

export const useTokenMode = (fromChainId: ChainsValues, toChainId: ChainsValues, token: Token) => {
  const { foreignChainId, isNativeBridge, isNativeToken } = getBridgeCommonInfo({
    fromChainId,
    toChainId,
    tokenAddress: token?.address || '',
  })

  const isEURCe = isSameString(token?.address, EURCe_GNOSIS)
  const shouldFetch =
    !isNativeToken && !!token?.address && !!foreignChainId && !isNativeBridge && !isEURCe

  const {
    data: nativeAddr,
    error,
    isLoading,
  } = useReadContract({
    address: contracts.OmniBridge.address[fromChainId],
    abi: contracts.OmniBridge.abi,
    functionName: 'nativeTokenAddress',
    args: [token?.address as `0x${string}`],
    chainId: fromChainId,
    query: { enabled: shouldFetch },
  })

  const data = useMemo((): TOKEN_MODE => {
    if (isEURCe) return 'ERC20'
    if (TokenOverrideManager.isOverridden(token?.address)) {
      return TokenOverrideManager.getOverride(token?.address).mode
    }
    if (nativeAddr && nativeAddr !== zeroAddress) return 'ERC677'
    return 'ERC20'
  }, [isEURCe, nativeAddr, token?.address])

  return { data, error, isLoading }
}
