import { useReadContracts } from 'wagmi'
import {
  contracts,
  homeOmniBridgeContract,
  homeXdaiBridgeContract,
} from '@/src/constants/config/contracts'
import { Chains, ChainsValues } from '@/src/constants/config/types'
import { chainsConfig } from '@/src/constants/config/chains'
import { NATIVE_TOKEN_ADDRESS } from '@/src/constants/config/common'
import { ZERO_ADDRESS } from '@/src/constants/misc'
import { isSameString } from '@/src/utils/tools'
import { Token } from '@/types/token'
import { TokenOverrideManager } from '@/src/utils/token-overrides'

const useBridgeLimits = (
  fromChainId: ChainsValues,
  toChainId: ChainsValues,
  fromToken: Token | undefined,
  toToken: Token | undefined,
) => {
  const fromTokenAddress =
    fromToken?.address == NATIVE_TOKEN_ADDRESS.toLowerCase() ? ZERO_ADDRESS : fromToken?.address

  const toTokenAddress =
    toToken?.address == NATIVE_TOKEN_ADDRESS.toLowerCase() ? ZERO_ADDRESS : toToken?.address

  const overwrittenMediator = fromTokenAddress
    ? TokenOverrideManager.isMediatorOverridden(fromTokenAddress, fromChainId)
    : false

  const isGnosisXDai =
    fromChainId == Chains.gnosis && isSameString(fromTokenAddress ?? '', ZERO_ADDRESS)
  const isForeignDAI =
    fromChainId != Chains.gnosis &&
    isSameString(fromTokenAddress ?? '', chainsConfig[fromChainId].bridge.DAI)
  const isForeignUSDS =
    fromChainId != Chains.gnosis &&
    isSameString(fromTokenAddress ?? '', chainsConfig[fromChainId].bridge.USDS)

  const isXdaiBridgeCase = isGnosisXDai || isForeignDAI || overwrittenMediator || isForeignUSDS
  const isOmniBridgeCase = !isXdaiBridgeCase && !!toTokenAddress
  const isDefaultCase = !isXdaiBridgeCase && !toTokenAddress && !!fromTokenAddress

  const xdaiBridgeAddress = (
    overwrittenMediator && fromTokenAddress
      ? TokenOverrideManager.getOverride(fromTokenAddress).mediator
      : contracts.XDAIBridge.address[fromChainId]
  ) as `0x${string}`

  const omniBridgeFromAddress = contracts.OmniBridge.address[fromChainId] as `0x${string}`
  const omniBridgeToAddress = contracts.OmniBridge.address[toChainId] as `0x${string}`
  const tokenAddr = (fromTokenAddress ?? ZERO_ADDRESS) as `0x${string}`

  const xdai = { ...homeXdaiBridgeContract, address: xdaiBridgeAddress, chainId: fromChainId }
  const omniFrom = {
    ...homeOmniBridgeContract,
    address: omniBridgeFromAddress,
    chainId: fromChainId,
  }
  const omniTo = { ...homeOmniBridgeContract, address: omniBridgeToAddress, chainId: toChainId }

  // --- XDAI bridge ---
  const { data: xdaiData, isLoading: xdaiLoading } = useReadContracts({
    contracts: [
      { ...xdai, functionName: 'getCurrentDay' },
      { ...xdai, functionName: 'dailyLimit' },
      { ...xdai, functionName: 'minPerTx' },
      { ...xdai, functionName: 'maxPerTx' },
    ],
    query: { enabled: isXdaiBridgeCase },
  })

  const [xdaiCurrentDayR, xdaiDailyLimitR, xdaiMinPerTxR, xdaiMaxPerTxR] = xdaiData ?? []
  const xdaiCurrentDay =
    xdaiCurrentDayR?.status === 'success' ? (xdaiCurrentDayR.result as bigint) : undefined

  const { data: xdaiTotalsData, isLoading: xdaiTotalsLoading } = useReadContracts({
    contracts: [{ ...xdai, functionName: 'totalSpentPerDay', args: [xdaiCurrentDay!] }],
    query: { enabled: isXdaiBridgeCase && xdaiCurrentDay !== undefined },
  })

  // --- OmniBridge ---
  const { data: omniData, isLoading: omniLoading } = useReadContracts({
    contracts: [
      { ...omniFrom, functionName: 'getCurrentDay' },
      { ...omniFrom, functionName: 'dailyLimit', args: [tokenAddr] },
      { ...omniFrom, functionName: 'minPerTx', args: [tokenAddr] },
      { ...omniFrom, functionName: 'maxPerTx', args: [tokenAddr] },
    ],
    query: { enabled: isOmniBridgeCase },
  })

  const [omniCurrentDayR, omniDailyLimitR, omniMinPerTxR, omniMaxPerTxR] = omniData ?? []
  const omniCurrentDay = omniCurrentDayR?.status === 'success' ? omniCurrentDayR.result : undefined

  const { data: omniTotalsData, isLoading: omniTotalsLoading } = useReadContracts({
    contracts: [
      { ...omniFrom, functionName: 'totalSpentPerDay', args: [tokenAddr, omniCurrentDay!] },
    ],
    query: { enabled: isOmniBridgeCase && omniCurrentDay !== undefined },
  })

  // --- Default case (no destination token) ---
  const { data: defaultData, isLoading: defaultLoading } = useReadContracts({
    contracts: [
      { ...omniFrom, functionName: 'minPerTx', args: [ZERO_ADDRESS] },
      { ...omniTo, functionName: 'executionMaxPerTx', args: [ZERO_ADDRESS] },
      { ...omniFrom, functionName: 'executionDailyLimit', args: [ZERO_ADDRESS] },
    ],
    query: { enabled: isDefaultCase },
  })

  // --- Assemble result ---
  if (isXdaiBridgeCase) {
    const dailyLimit = xdaiDailyLimitR?.status === 'success' ? xdaiDailyLimitR.result : undefined
    const minPerTx = xdaiMinPerTxR?.status === 'success' ? xdaiMinPerTxR.result : undefined
    const maxPerTx = xdaiMaxPerTxR?.status === 'success' ? xdaiMaxPerTxR.result : undefined
    const totalSpentPerDay =
      xdaiTotalsData?.[0]?.status === 'success' ? xdaiTotalsData[0].result : undefined

    const isLoading = xdaiLoading || xdaiTotalsLoading
    const data =
      dailyLimit !== undefined &&
      minPerTx !== undefined &&
      maxPerTx !== undefined &&
      totalSpentPerDay !== undefined
        ? { dailyLimit, minPerTx, maxPerTx, totalSpentPerDay }
        : undefined

    return { data, isLoading }
  }

  if (isOmniBridgeCase) {
    const dailyLimit = omniDailyLimitR?.status === 'success' ? omniDailyLimitR.result : undefined
    const minPerTx = omniMinPerTxR?.status === 'success' ? omniMinPerTxR.result : undefined
    const maxPerTx = omniMaxPerTxR?.status === 'success' ? omniMaxPerTxR.result : undefined
    const totalSpentPerDay =
      omniTotalsData?.[0]?.status === 'success' ? omniTotalsData[0].result : undefined

    const isLoading = omniLoading || omniTotalsLoading
    const data =
      dailyLimit !== undefined &&
      minPerTx !== undefined &&
      maxPerTx !== undefined &&
      totalSpentPerDay !== undefined
        ? { dailyLimit, minPerTx, maxPerTx, totalSpentPerDay }
        : undefined

    return { data, isLoading }
  }

  if (isDefaultCase) {
    const [defaultMinR, defaultMaxR, defaultDailyR] = defaultData ?? []
    let minPerTx = defaultMinR?.status === 'success' ? defaultMinR.result : undefined
    let maxPerTx = defaultMaxR?.status === 'success' ? defaultMaxR.result : undefined
    let dailyLimit = defaultDailyR?.status === 'success' ? defaultDailyR.result : undefined

    const decimals = fromToken?.decimals ?? 18

    if (minPerTx !== undefined && maxPerTx !== undefined && dailyLimit !== undefined) {
      if (decimals < 18) {
        const factor = 10n ** BigInt(18 - decimals)
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
        const factor = 10n ** BigInt(decimals - 18)
        minPerTx = minPerTx * factor
        maxPerTx = maxPerTx * factor
        dailyLimit = dailyLimit * factor
      }
    }

    const data =
      minPerTx !== undefined && maxPerTx !== undefined && dailyLimit !== undefined
        ? { minPerTx, maxPerTx, dailyLimit, totalSpentPerDay: 0n }
        : undefined

    return { data, isLoading: defaultLoading }
  }

  return { data: undefined, isLoading: false }
}

export default useBridgeLimits
