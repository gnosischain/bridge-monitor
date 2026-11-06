import { useReadContracts } from 'wagmi'

import { contracts } from '@/src/constants/config/contracts'
import { Chains, ChainsValues } from '@/src/constants/config/types'
import { Token } from '@/types/token'
import { Address } from 'viem'

// Home and Foreign Omni mediators share the same limit-reading interface, so a single
// ABI encodes the reads for both sides (the address differs per chain).
const OMNI_ABI = contracts.OmniBridge.abi

const useOMNIBridgeLimits = (token: Token, chainId: ChainsValues) => {
  const tokenAddress = token.address as Address

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

  // totals depend on the on-chain current day, so they run once `base` is loaded
  const day = onChainCurrentDay ?? 0n
  const { data: totals, isLoading: isLoadingTotals } = useReadContracts({
    allowFailure: false,
    contracts: [
      { ...omni, functionName: 'totalSpentPerDay', args: [tokenAddress, day] },
      { ...omni, functionName: 'totalExecutedPerDay', args: [tokenAddress, day] },
    ],
    query: { enabled: onChainCurrentDay !== undefined },
  })

  const [totalSpentPerDay, totalExecutedPerDay] = totals ?? []

  // raw uint256 wei; the consuming render component formats using `token.decimals`
  return {
    information: {
      isTokenRegistered,
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

export const useHomeOMNIBridgeLimits = (token: Token) => {
  const { information, isLoading } = useOMNIBridgeLimits(token, Chains.gnosis)
  return { homeOmniInformation: information, isLoading }
}

export const useForeignOMNIBridgeLimits = (token: Token) => {
  const { information, isLoading } = useOMNIBridgeLimits(token, Chains.mainnet)
  return { foreignOmniInformation: information, isLoading }
}
