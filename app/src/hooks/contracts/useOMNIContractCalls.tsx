import { useReadContracts } from 'wagmi'

import { contracts } from '@/src/constants/config/contracts'
import { Chains, ChainsValues } from '@/src/constants/config/types'
import { toNumber } from '@/src/utils/bigNumber'
import { Token } from '@/types/token'
import { Address } from 'viem'

// Home and Foreign Omni mediators share the same limit-reading interface, so a single
// ABI encodes the reads for both sides (the address differs per chain).
const OMNI_ABI = contracts.OmniBridge.abi

const useOMNIBridgeLimits = (token: Token, chainId: ChainsValues, currentDay: string = '0') => {
  const tokenAddress = token.address as Address
  const tokenAmountToNumber = toNumber(token.decimals)

  const omni = {
    address: contracts.OmniBridge.address[chainId],
    abi: OMNI_ABI,
    chainId,
  } as const

  // context + per-token limits (independent of the current day)
  const { data: base, isLoading: isLoadingBase } = useReadContracts({
    allowFailure: false,
    contracts: [
      { ...omni, functionName: 'getCurrentDay' },
      { ...omni, functionName: 'isTokenRegistered', args: [tokenAddress] },
      { ...omni, functionName: 'dailyLimit', args: [tokenAddress] },
      { ...omni, functionName: 'executionDailyLimit', args: [tokenAddress] },
      { ...omni, functionName: 'minPerTx', args: [tokenAddress] },
      { ...omni, functionName: 'maxPerTx', args: [tokenAddress] },
      { ...omni, functionName: 'executionMaxPerTx', args: [tokenAddress] },
    ],
  })

  const [
    onChainCurrentDay,
    isTokenRegistered = false,
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
      { ...omni, functionName: 'totalSpentPerDay', args: [tokenAddress, day] },
      { ...omni, functionName: 'totalExecutedPerDay', args: [tokenAddress, day] },
    ],
    query: { enabled: onChainCurrentDay !== undefined },
  })

  const [totalSpentPerDay, totalExecutedPerDay] = totals ?? []

  return {
    information: {
      isTokenRegistered,
      dailyLimit: tokenAmountToNumber(dailyLimit) ?? 0,
      executionDailyLimit: tokenAmountToNumber(executionDailyLimit) ?? 0,
      minPerTx: tokenAmountToNumber(minPerTx) ?? 0,
      maxPerTx: tokenAmountToNumber(maxPerTx) ?? 0,
      executionMaxPerTx: tokenAmountToNumber(executionMaxPerTx) ?? 0,
      totalSpentPerDay: tokenAmountToNumber(totalSpentPerDay) ?? 0,
      totalExecutedPerDay: tokenAmountToNumber(totalExecutedPerDay) ?? 0,
    },
    isLoading: isLoadingBase || isLoadingTotals || (base !== undefined && totals === undefined),
  }
}

export const useHomeOMNIBridgeLimits = (token: Token, currentDay: string = '0') => {
  const { information, isLoading } = useOMNIBridgeLimits(token, Chains.gnosis, currentDay)
  return { homeOmniInformation: information, isLoading }
}

export const useForeignOMNIBridgeLimits = (token: Token, currentDay: string = '0') => {
  const { information, isLoading } = useOMNIBridgeLimits(token, Chains.mainnet, currentDay)
  return { foreignOmniInformation: information, isLoading }
}
