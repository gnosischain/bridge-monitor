import { useMemo } from 'react'
import { useReadContracts } from 'wagmi'
import { Address, zeroAddress } from 'viem'

import { contracts } from '@/src/constants/config/contracts'
import { Chains, ChainsValues } from '@/src/constants/config/types'
import { chainsConfig } from '@/src/constants/config/chains'
import { NATIVE_TOKEN_ADDRESS } from '@/src/constants/config/common'
import { isSameString } from '@/src/utils/tools'
import { Token } from '@/types/token'
import { TokenOverrideManager } from '@/src/utils/token-overrides'

export type BridgeLimits = {
  dailyLimit: bigint
  minPerTx: bigint
  maxPerTx: bigint
  totalSpentPerDay: bigint
}

const XDAI_ABI = contracts.XDAIBridge.abi
const OMNI_ABI = contracts.OmniBridge.abi

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
      const address = (
        overwrittenMediator
          ? TokenOverrideManager.getOverride(fromTokenAddress).mediator
          : contracts.XDAIBridge.address[fromChainId]
      ) as Address
      return { kind: 'xdai' as const, address }
    }

    if (toTokenAddress) {
      return {
        kind: 'omni' as const,
        address: contracts.OmniBridge.address[fromChainId],
        token: fromTokenAddress as Address,
      }
    }

    return { kind: 'default' as const }
  }, [fromChainId, fromTokenAddress, toTokenAddress])

  // --- XDAI-style branch (no token arg) ---
  const isXdai = branch?.kind === 'xdai'
  const xdaiAddress = branch?.kind === 'xdai' ? branch.address : zeroAddress
  const xdai = { address: xdaiAddress, abi: XDAI_ABI, chainId: fromChainId } as const

  const { data: xdaiBase, isLoading: xdaiBaseLoading } = useReadContracts({
    allowFailure: false,
    contracts: [
      { ...xdai, functionName: 'getCurrentDay' },
      { ...xdai, functionName: 'dailyLimit' },
      { ...xdai, functionName: 'minPerTx' },
      { ...xdai, functionName: 'maxPerTx' },
    ],
    query: { enabled: isXdai },
  })

  const xdaiDay = xdaiBase?.[0]
  const { data: xdaiTotals, isLoading: xdaiTotalsLoading } = useReadContracts({
    allowFailure: false,
    contracts: [{ ...xdai, functionName: 'totalSpentPerDay', args: [xdaiDay ?? 0n] }],
    query: { enabled: isXdai && xdaiDay !== undefined },
  })

  // --- Omni-style branch (token arg) ---
  const isOmni = branch?.kind === 'omni'
  const omniToken = branch?.kind === 'omni' ? branch.token : zeroAddress
  const omni = {
    address: contracts.OmniBridge.address[fromChainId],
    abi: OMNI_ABI,
    chainId: fromChainId,
  } as const

  const { data: omniBase, isLoading: omniBaseLoading } = useReadContracts({
    allowFailure: false,
    contracts: [
      { ...omni, functionName: 'getCurrentDay' },
      { ...omni, functionName: 'dailyLimit', args: [omniToken] },
      { ...omni, functionName: 'minPerTx', args: [omniToken] },
      { ...omni, functionName: 'maxPerTx', args: [omniToken] },
    ],
    query: { enabled: isOmni },
  })

  const omniDay = omniBase?.[0]
  const { data: omniTotals, isLoading: omniTotalsLoading } = useReadContracts({
    allowFailure: false,
    contracts: [{ ...omni, functionName: 'totalSpentPerDay', args: [omniToken, omniDay ?? 0n] }],
    query: { enabled: isOmni && omniDay !== undefined },
  })

  // --- Default branch (destination token doesn't exist yet) — cross-chain reads ---
  const isDefault = branch?.kind === 'default'
  const { data: defaultData, isLoading: defaultLoading } = useReadContracts({
    allowFailure: false,
    contracts: [
      {
        address: contracts.OmniBridge.address[fromChainId],
        abi: OMNI_ABI,
        chainId: fromChainId,
        functionName: 'minPerTx',
        args: [zeroAddress],
      },
      {
        address: contracts.OmniBridge.address[toChainId],
        abi: OMNI_ABI,
        chainId: toChainId,
        functionName: 'executionMaxPerTx',
        args: [zeroAddress],
      },
      {
        address: contracts.OmniBridge.address[fromChainId],
        abi: OMNI_ABI,
        chainId: fromChainId,
        functionName: 'executionDailyLimit',
        args: [zeroAddress],
      },
    ],
    query: { enabled: isDefault },
  })

  const data = useMemo((): BridgeLimits | undefined => {
    if (!branch) return undefined

    if (branch.kind === 'default') {
      if (!defaultData) return undefined
      const [minPerTx, maxPerTx, dailyLimit] = defaultData
      return scaleDefaultLimits(minPerTx, maxPerTx, dailyLimit, fromToken?.decimals || 18)
    }

    const base = branch.kind === 'xdai' ? xdaiBase : omniBase
    const totals = branch.kind === 'xdai' ? xdaiTotals : omniTotals
    if (!base || !totals) return undefined

    const [, dailyLimit, minPerTx, maxPerTx] = base
    const [totalSpentPerDay] = totals
    return { dailyLimit, minPerTx, maxPerTx, totalSpentPerDay }
  }, [branch, xdaiBase, xdaiTotals, omniBase, omniTotals, defaultData, fromToken?.decimals])

  const isLoading = useMemo(() => {
    if (!branch) return false
    if (branch.kind === 'default') return defaultLoading
    if (branch.kind === 'xdai') {
      return xdaiBaseLoading || xdaiTotalsLoading || (!!xdaiBase && !xdaiTotals)
    }
    return omniBaseLoading || omniTotalsLoading || (!!omniBase && !omniTotals)
  }, [
    branch,
    defaultLoading,
    xdaiBaseLoading,
    xdaiTotalsLoading,
    xdaiBase,
    xdaiTotals,
    omniBaseLoading,
    omniTotalsLoading,
    omniBase,
    omniTotals,
  ])

  return { data, isLoading }
}

export default useBridgeLimits
