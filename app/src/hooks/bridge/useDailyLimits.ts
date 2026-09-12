import { useMemo } from 'react'
import { type Address } from 'viem'
import { useReadContracts } from 'wagmi'

import { contracts } from '@/src/constants/config/contracts'
import { ChainsValues } from '@/src/constants/config/types'

/**
 * One side of a bridge's per-day limit state, as the contracts report it: raw uint256 wei. The
 * consuming component formats using the token's decimals.
 */
export type DailyLimits = {
  dailyLimit: bigint
  executionDailyLimit: bigint
  minPerTx: bigint
  maxPerTx: bigint
  executionMaxPerTx: bigint
  totalSpentPerDay: bigint
  totalExecutedPerDay: bigint
}

/** Adds the OmniBridge-only registration flag to the shared limit set. */
export type OmniDailyLimits = DailyLimits & { isTokenRegistered: boolean }

/**
 * Both bridges report their limits the same way: a first read for the day-independent limits plus
 * the chain's current day, then a second read for the day's running totals. The two hooks below
 * differ only in that the OmniBridge's limits are per token, so its calls take a token argument.
 *
 * They are two hooks rather than one parameterised one on purpose: keeping each `contracts` array
 * literal is what lets wagmi infer the results as typed tuples. Building the array dynamically
 * collapses every result to `unknown`.
 */

/** The on-chain day wins; `fallback` only covers the window before the first read resolves. */
const resolveDay = (onChainDay: bigint | undefined, fallback: string) =>
  onChainDay ?? (fallback ? BigInt(fallback) : 0n)

/**
 * True until both phases have settled. The trailing clause covers the gap after the base read
 * resolves but before the day-dependent totals read reports as fetching.
 */
const isTwoPhaseLoading = (
  baseLoading: boolean,
  totalsLoading: boolean,
  base: unknown,
  totals: unknown,
) => baseLoading || totalsLoading || (base !== undefined && totals === undefined)

export const useXdaiDailyLimits = ({
  address,
  chainId,
  currentDay = '0',
  enabled = true,
}: {
  chainId: ChainsValues
  /** Defaults to the registry's bridge for `chainId`; pass one to read an overridden mediator. */
  address?: Address
  currentDay?: string
  enabled?: boolean
}): { data: DailyLimits | undefined; isLoading: boolean } => {
  const xdai = {
    address: address ?? contracts.XDAIBridge[chainId].address,
    abi: contracts.XDAIBridge[chainId].abi,
    chainId,
  } as const

  const { data: base, isLoading: baseLoading } = useReadContracts({
    allowFailure: false,
    contracts: [
      { ...xdai, functionName: 'getCurrentDay' },
      { ...xdai, functionName: 'dailyLimit' },
      { ...xdai, functionName: 'executionDailyLimit' },
      { ...xdai, functionName: 'minPerTx' },
      { ...xdai, functionName: 'maxPerTx' },
      { ...xdai, functionName: 'executionMaxPerTx' },
    ],
    query: { enabled },
  })

  const onChainDay = base?.[0]
  const day = resolveDay(onChainDay, currentDay)

  const { data: totals, isLoading: totalsLoading } = useReadContracts({
    allowFailure: false,
    contracts: [
      { ...xdai, functionName: 'totalSpentPerDay', args: [day] },
      { ...xdai, functionName: 'totalExecutedPerDay', args: [day] },
    ],
    query: { enabled: enabled && onChainDay !== undefined },
  })

  // destructured inside the guard so the reads keep their tuple element types
  const data = useMemo(() => {
    if (!base || !totals) return undefined
    const [, dailyLimit, executionDailyLimit, minPerTx, maxPerTx, executionMaxPerTx] = base
    const [totalSpentPerDay, totalExecutedPerDay] = totals
    return {
      dailyLimit,
      executionDailyLimit,
      minPerTx,
      maxPerTx,
      executionMaxPerTx,
      totalSpentPerDay,
      totalExecutedPerDay,
    }
  }, [base, totals])

  return { data, isLoading: isTwoPhaseLoading(baseLoading, totalsLoading, base, totals) }
}

export const useOmniDailyLimits = ({
  address,
  chainId,
  currentDay = '0',
  enabled = true,
  token,
}: {
  chainId: ChainsValues
  token: Address
  /** Defaults to the registry's mediator for `chainId`; pass one to read an overridden mediator. */
  address?: Address
  currentDay?: string
  enabled?: boolean
}): { data: OmniDailyLimits | undefined; isLoading: boolean } => {
  const omni = {
    address: address ?? contracts.OmniBridge[chainId].address,
    abi: contracts.OmniBridge[chainId].abi,
    chainId,
  } as const

  const { data: base, isLoading: baseLoading } = useReadContracts({
    allowFailure: false,
    contracts: [
      { ...omni, functionName: 'getCurrentDay' },
      { ...omni, functionName: 'isTokenRegistered', args: [token] },
      { ...omni, functionName: 'dailyLimit', args: [token] },
      { ...omni, functionName: 'executionDailyLimit', args: [token] },
      { ...omni, functionName: 'minPerTx', args: [token] },
      { ...omni, functionName: 'maxPerTx', args: [token] },
      { ...omni, functionName: 'executionMaxPerTx', args: [token] },
    ],
    query: { enabled },
  })

  const onChainDay = base?.[0]
  const day = resolveDay(onChainDay, currentDay)

  const { data: totals, isLoading: totalsLoading } = useReadContracts({
    allowFailure: false,
    contracts: [
      { ...omni, functionName: 'totalSpentPerDay', args: [token, day] },
      { ...omni, functionName: 'totalExecutedPerDay', args: [token, day] },
    ],
    query: { enabled: enabled && onChainDay !== undefined },
  })

  // destructured inside the guard so the reads keep their tuple element types
  const data = useMemo(() => {
    if (!base || !totals) return undefined
    const [
      ,
      isTokenRegistered,
      dailyLimit,
      executionDailyLimit,
      minPerTx,
      maxPerTx,
      executionMaxPerTx,
    ] = base
    const [totalSpentPerDay, totalExecutedPerDay] = totals
    return {
      isTokenRegistered,
      dailyLimit,
      executionDailyLimit,
      minPerTx,
      maxPerTx,
      executionMaxPerTx,
      totalSpentPerDay,
      totalExecutedPerDay,
    }
  }, [base, totals])

  return { data, isLoading: isTwoPhaseLoading(baseLoading, totalsLoading, base, totals) }
}
