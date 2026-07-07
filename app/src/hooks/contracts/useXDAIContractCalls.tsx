import { useReadContracts } from 'wagmi'

import { contracts } from '@/src/constants/config/contracts'
import { Chains, ChainsValues } from '@/src/constants/config/types'

// Home and Foreign XDAI bridges share the same limit-reading interface, so a single
// ABI encodes the reads for both sides (the address differs per chain).
const XDAI_ABI = contracts.XDAIBridge.abi

const useXDAIBridgeLimits = (chainId: ChainsValues, currentDay: string = '0') => {
  const xdai = {
    address: contracts.XDAIBridge.address[chainId],
    abi: XDAI_ABI,
    chainId,
  } as const

  // per-tx / per-day limits (independent of the current day)
  const { data: base, isLoading: isLoadingBase } = useReadContracts({
    allowFailure: false,
    contracts: [
      { ...xdai, functionName: 'getCurrentDay' },
      { ...xdai, functionName: 'dailyLimit' },
      { ...xdai, functionName: 'executionDailyLimit' },
      { ...xdai, functionName: 'minPerTx' },
      { ...xdai, functionName: 'maxPerTx' },
      { ...xdai, functionName: 'executionMaxPerTx' },
    ],
  })

  const [
    onChainCurrentDay,
    dailyLimit,
    executionDailyLimit,
    minPerTx,
    maxPerTx,
    executionMaxPerTx,
  ] = base ?? []

  // the on-chain current day wins; the passed value is only a fallback (e.g. `?d=` history)
  const day = onChainCurrentDay ?? (currentDay ? BigInt(currentDay) : 0n)

  // totals depend on the resolved current day, so they run once `base` is loaded
  const { data: totals, isLoading: isLoadingTotals } = useReadContracts({
    allowFailure: false,
    contracts: [
      { ...xdai, functionName: 'totalSpentPerDay', args: [day] },
      { ...xdai, functionName: 'totalExecutedPerDay', args: [day] },
    ],
    query: { enabled: onChainCurrentDay !== undefined },
  })

  const [totalSpentPerDay, totalExecutedPerDay] = totals ?? []

  // raw uint256 wei; the consuming render component formats using `token.decimals`
  return {
    information: {
      dailyLimit: dailyLimit ?? 0n,
      executionDailyLimit: executionDailyLimit ?? 0n,
      minPerTx: minPerTx ?? 0n,
      maxPerTx: maxPerTx ?? 0n,
      executionMaxPerTx: executionMaxPerTx ?? 0n,
      totalSpentPerDay: totalSpentPerDay ?? 0n,
      totalExecutedPerDay: totalExecutedPerDay ?? 0n,
    },
    isLoading: isLoadingBase || isLoadingTotals || (base !== undefined && totals === undefined),
  }
}

export const useHomeXDAIBridgeLimits = (currentDay: string = '0') => {
  const { information, isLoading } = useXDAIBridgeLimits(Chains.gnosis, currentDay)
  return { homeXdaiInformation: information, isLoading }
}

export const useForeignXDAIBridgeLimits = (currentDay: string = '0') => {
  const { information, isLoading } = useXDAIBridgeLimits(Chains.mainnet, currentDay)
  return { foreignXdaiInformation: information, isLoading }
}
