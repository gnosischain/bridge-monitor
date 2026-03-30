import { useReadContracts } from 'wagmi'
import { Token } from '@/types/token'
import { foreignOmniBridgeContract, homeOmniBridgeContract } from '@/src/constants/config/contracts'

export const useHomeOMNIBridgeLimits = (token: Token) => {
  const tokenAddress = token.address as `0x${string}`

  const { data } = useReadContracts({
    contracts: [
      { ...homeOmniBridgeContract, functionName: 'getCurrentDay' },
      { ...homeOmniBridgeContract, functionName: 'isTokenRegistered', args: [tokenAddress] },
      { ...homeOmniBridgeContract, functionName: 'dailyLimit', args: [tokenAddress] },
      { ...homeOmniBridgeContract, functionName: 'executionDailyLimit', args: [tokenAddress] },
      { ...homeOmniBridgeContract, functionName: 'minPerTx', args: [tokenAddress] },
      { ...homeOmniBridgeContract, functionName: 'maxPerTx', args: [tokenAddress] },
      { ...homeOmniBridgeContract, functionName: 'executionMaxPerTx', args: [tokenAddress] },
    ],
  })

  const [
    currentDayR,
    isTokenRegisteredR,
    dailyLimitR,
    executionDailyLimitR,
    minPerTxR,
    maxPerTxR,
    executionMaxPerTxR,
  ] = data ?? []

  const currentDay = currentDayR?.status === 'success' ? currentDayR.result : undefined
  const isTokenRegistered =
    isTokenRegisteredR?.status === 'success' ? isTokenRegisteredR.result : false
  const [dailyLimit, executionDailyLimit, minPerTx, maxPerTx, executionMaxPerTx] = [
    dailyLimitR,
    executionDailyLimitR,
    minPerTxR,
    maxPerTxR,
    executionMaxPerTxR,
  ].map((r) => (r?.status === 'success' ? r.result : undefined))

  const { data: totalsData } = useReadContracts({
    contracts: [
      {
        ...homeOmniBridgeContract,
        functionName: 'totalSpentPerDay',
        args: [tokenAddress, currentDay!],
      },
      {
        ...homeOmniBridgeContract,
        functionName: 'totalExecutedPerDay',
        args: [tokenAddress, currentDay!],
      },
    ],
    query: { enabled: currentDay !== undefined },
  })

  const [totalSpentPerDay, totalExecutedPerDay] =
    totalsData?.map((r) => (r.status === 'success' ? r.result : undefined)) ?? []

  return {
    homeOmniInformation: {
      isTokenRegistered,
      dailyLimit,
      executionDailyLimit,
      minPerTx,
      maxPerTx,
      executionMaxPerTx,
      totalSpentPerDay,
      totalExecutedPerDay,
    },
  }
}

export const useForeignOMNIBridgeLimits = (token: Token) => {
  const tokenAddress = token.address as `0x${string}`

  const { data } = useReadContracts({
    contracts: [
      { ...foreignOmniBridgeContract, functionName: 'getCurrentDay' },
      { ...foreignOmniBridgeContract, functionName: 'isTokenRegistered', args: [tokenAddress] },
      { ...foreignOmniBridgeContract, functionName: 'dailyLimit', args: [tokenAddress] },
      { ...foreignOmniBridgeContract, functionName: 'executionDailyLimit', args: [tokenAddress] },
      { ...foreignOmniBridgeContract, functionName: 'minPerTx', args: [tokenAddress] },
      { ...foreignOmniBridgeContract, functionName: 'maxPerTx', args: [tokenAddress] },
      { ...foreignOmniBridgeContract, functionName: 'executionMaxPerTx', args: [tokenAddress] },
    ],
  })

  const [
    currentDayR,
    isTokenRegisteredR,
    dailyLimitR,
    executionDailyLimitR,
    minPerTxR,
    maxPerTxR,
    executionMaxPerTxR,
  ] = data ?? []

  const currentDay = currentDayR?.status === 'success' ? currentDayR.result : undefined
  const isTokenRegistered =
    isTokenRegisteredR?.status === 'success' ? isTokenRegisteredR.result : false
  const [dailyLimit, executionDailyLimit, minPerTx, maxPerTx, executionMaxPerTx] = [
    dailyLimitR,
    executionDailyLimitR,
    minPerTxR,
    maxPerTxR,
    executionMaxPerTxR,
  ].map((r) => (r?.status === 'success' ? r.result : undefined))

  const { data: totalsData } = useReadContracts({
    contracts: [
      {
        ...foreignOmniBridgeContract,
        functionName: 'totalSpentPerDay',
        args: [tokenAddress, currentDay!],
      },
      {
        ...foreignOmniBridgeContract,
        functionName: 'totalExecutedPerDay',
        args: [tokenAddress, currentDay!],
      },
    ],
    query: { enabled: currentDay !== undefined },
  })

  const [totalSpentPerDay, totalExecutedPerDay] =
    totalsData?.map((r) => (r.status === 'success' ? r.result : undefined)) ?? []

  return {
    foreignOmniInformation: {
      isTokenRegistered,
      dailyLimit,
      executionDailyLimit,
      minPerTx,
      maxPerTx,
      executionMaxPerTx,
      totalSpentPerDay,
      totalExecutedPerDay,
    },
  }
}
