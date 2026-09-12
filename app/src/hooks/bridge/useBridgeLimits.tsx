import { useMemo } from 'react'
import { useReadContracts } from 'wagmi'
import { Address, zeroAddress } from 'viem'

import { contracts } from '@/src/constants/config/contracts'
import { Chains, ChainsValues } from '@/src/constants/config/types'
import { chainsConfig } from '@/src/constants/config/chains'
import { NATIVE_TOKEN_ADDRESS } from '@/src/constants/config/common'
import { useOmniDailyLimits, useXdaiDailyLimits } from '@/src/hooks/bridge/useDailyLimits'
import { isSameString } from '@/src/utils/tools'
import { Token } from '@/types/token'
import { TokenOverrideManager } from '@/src/utils/token-overrides'

/**
 * The subset of a bridge's limits the send form validates against. Narrower than `DailyLimits`
 * because the default branch below can only synthesise these four.
 */
export type BridgeLimits = {
  dailyLimit: bigint
  minPerTx: bigint
  maxPerTx: bigint
  totalSpentPerDay: bigint
}

/**
 * Scales the default limits (read at 18 decimals from the mediator) to the token's decimals.
 * Ported verbatim from the previous `getDefaultTokenLimits`.
 */
const scaleDefaultLimits = (
  rawMinPerTx: bigint,
  rawMaxPerTx: bigint,
  rawDailyLimit: bigint,
  decimals: number,
): BridgeLimits => {
  let minPerTx = rawMinPerTx
  let maxPerTx = rawMaxPerTx
  let dailyLimit = rawDailyLimit

  if (decimals < 18) {
    const factor = 10n ** (18n - BigInt(decimals))
    minPerTx = minPerTx / factor
    maxPerTx = maxPerTx / factor
    dailyLimit = dailyLimit / factor

    if (minPerTx === 0n) {
      minPerTx = 1n
      if (maxPerTx <= minPerTx) {
        maxPerTx = 100n
        if (dailyLimit <= maxPerTx) {
          dailyLimit = 10000n
        }
      }
    }
  } else {
    const factor = 10n ** (BigInt(decimals) - 18n)
    minPerTx = minPerTx * factor
    maxPerTx = maxPerTx * factor
    dailyLimit = dailyLimit * factor
  }

  return { minPerTx, maxPerTx, dailyLimit, totalSpentPerDay: 0n }
}

const useBridgeLimits = (
  fromChainId: ChainsValues,
  toChainId: ChainsValues,
  fromToken: Token | undefined,
  toToken: Token | undefined,
) => {
  // For Mainnet ETH the address arrives as 0xeee…eee; the bridge expects 0x0.
  const fromTokenAddress =
    fromToken?.address == NATIVE_TOKEN_ADDRESS.toLowerCase() ? zeroAddress : fromToken?.address
  const toTokenAddress =
    toToken?.address == NATIVE_TOKEN_ADDRESS.toLowerCase() ? zeroAddress : toToken?.address

  const branch = useMemo(() => {
    if (!fromChainId || !fromTokenAddress) return null

    const overwrittenMediator = TokenOverrideManager.isMediatorOverridden(
      fromTokenAddress,
      fromChainId,
    )
    const isGnosisXDai = fromChainId == Chains.gnosis && isSameString(fromTokenAddress, zeroAddress)
    const isForeignDAI =
      fromChainId != Chains.gnosis &&
      isSameString(fromTokenAddress, chainsConfig[fromChainId].bridge.DAI)
    const isForeignUSDS =
      fromChainId != Chains.gnosis &&
      isSameString(fromTokenAddress, chainsConfig[fromChainId].bridge.USDS)

    if (isGnosisXDai || isForeignDAI || overwrittenMediator || isForeignUSDS) {
      return {
        kind: 'xdai' as const,
        // an override reads its own mediator; otherwise the registry's bridge is used
        address: overwrittenMediator
          ? (TokenOverrideManager.getOverride(fromTokenAddress).mediator as Address)
          : undefined,
      }
    }

    if (toTokenAddress) {
      return { kind: 'omni' as const, token: fromTokenAddress as Address }
    }

    return { kind: 'default' as const }
  }, [fromChainId, fromTokenAddress, toTokenAddress])

  // Every branch's hook runs on every render (rules of hooks); `enabled` decides which one
  // actually hits the chain.
  const { data: xdaiLimits, isLoading: xdaiLoading } = useXdaiDailyLimits({
    chainId: fromChainId,
    address: branch?.kind === 'xdai' ? branch.address : undefined,
    enabled: branch?.kind === 'xdai',
  })

  const { data: omniLimits, isLoading: omniLoading } = useOmniDailyLimits({
    chainId: fromChainId,
    token: branch?.kind === 'omni' ? branch.token : zeroAddress,
    enabled: branch?.kind === 'omni',
  })

  // --- Default branch (destination token doesn't exist yet) — cross-chain reads ---
  const { data: defaultData, isLoading: defaultLoading } = useReadContracts({
    allowFailure: false,
    contracts: [
      {
        ...contracts.OmniBridge[fromChainId],
        chainId: fromChainId,
        functionName: 'minPerTx',
        args: [zeroAddress],
      },
      {
        ...contracts.OmniBridge[toChainId],
        chainId: toChainId,
        functionName: 'executionMaxPerTx',
        args: [zeroAddress],
      },
      {
        ...contracts.OmniBridge[fromChainId],
        chainId: fromChainId,
        functionName: 'executionDailyLimit',
        args: [zeroAddress],
      },
    ],
    query: { enabled: branch?.kind === 'default' },
  })

  const data = useMemo((): BridgeLimits | undefined => {
    if (!branch) return undefined

    if (branch.kind === 'default') {
      if (!defaultData) return undefined
      const [minPerTx, maxPerTx, dailyLimit] = defaultData
      return scaleDefaultLimits(minPerTx, maxPerTx, dailyLimit, fromToken?.decimals || 18)
    }

    const limits = branch.kind === 'xdai' ? xdaiLimits : omniLimits
    if (!limits) return undefined

    const { dailyLimit, maxPerTx, minPerTx, totalSpentPerDay } = limits
    return { dailyLimit, minPerTx, maxPerTx, totalSpentPerDay }
  }, [branch, xdaiLimits, omniLimits, defaultData, fromToken?.decimals])

  const isLoading = useMemo(() => {
    if (!branch) return false
    if (branch.kind === 'default') return defaultLoading
    return branch.kind === 'xdai' ? xdaiLoading : omniLoading
  }, [branch, defaultLoading, xdaiLoading, omniLoading])

  return { data, isLoading }
}

export default useBridgeLimits
