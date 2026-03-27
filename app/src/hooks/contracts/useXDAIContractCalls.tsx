import { useReadContracts } from 'wagmi'
import { foreignXdaiBridgeContract, homeXdaiBridgeContract } from '@/src/constants/config/contracts'

export const useHomeXDAIBridgeLimits = () => {
  const { data } = useReadContracts({
    contracts: [
      { ...homeXdaiBridgeContract, functionName: 'getCurrentDay' },
      { ...homeXdaiBridgeContract, functionName: 'dailyLimit' },
      { ...homeXdaiBridgeContract, functionName: 'executionDailyLimit' },
      { ...homeXdaiBridgeContract, functionName: 'minPerTx' },
      { ...homeXdaiBridgeContract, functionName: 'maxPerTx' },
      { ...homeXdaiBridgeContract, functionName: 'executionMaxPerTx' },
    ],
  })

  const [currentDay, dailyLimit, executionDailyLimit, minPerTx, maxPerTx, executionMaxPerTx] =
    data?.map((r) => (r.status === 'success' ? (r.result as bigint) : undefined)) ?? []

  const { data: totalsData } = useReadContracts({
    contracts: [
      { ...homeXdaiBridgeContract, functionName: 'totalSpentPerDay', args: [currentDay!] },
      { ...homeXdaiBridgeContract, functionName: 'totalExecutedPerDay', args: [currentDay!] },
    ],
    query: { enabled: currentDay !== undefined },
  })

  const [totalSpentPerDay, totalExecutedPerDay] =
    totalsData?.map((r) => (r.status === 'success' ? (r.result as bigint) : undefined)) ?? []

  return {
    homeXdaiInformation: {
      dailyLimit: dailyLimit,
      executionDailyLimit: executionDailyLimit,
      minPerTx: minPerTx,
      maxPerTx: maxPerTx,
      executionMaxPerTx: executionMaxPerTx,
      totalSpentPerDay: totalSpentPerDay,
      totalExecutedPerDay: totalExecutedPerDay,
    },
  }
}

export const useForeignXDAIBridgeLimits = () => {
  const { data } = useReadContracts({
    contracts: [
      { ...foreignXdaiBridgeContract, functionName: 'getCurrentDay' },
      { ...foreignXdaiBridgeContract, functionName: 'dailyLimit' },
      { ...foreignXdaiBridgeContract, functionName: 'executionDailyLimit' },
      { ...foreignXdaiBridgeContract, functionName: 'minPerTx' },
      { ...foreignXdaiBridgeContract, functionName: 'maxPerTx' },
      { ...foreignXdaiBridgeContract, functionName: 'executionMaxPerTx' },
    ],
  })

  const [currentDay, dailyLimit, executionDailyLimit, minPerTx, maxPerTx, executionMaxPerTx] =
    data?.map((r) => (r.status === 'success' ? (r.result as bigint) : undefined)) ?? []

  const { data: totalsData } = useReadContracts({
    contracts: [
      { ...foreignXdaiBridgeContract, functionName: 'totalSpentPerDay', args: [currentDay!] },
      { ...foreignXdaiBridgeContract, functionName: 'totalExecutedPerDay', args: [currentDay!] },
    ],
    query: { enabled: currentDay !== undefined },
  })

  const [totalSpentPerDay, totalExecutedPerDay] =
    totalsData?.map((r) => (r.status === 'success' ? (r.result as bigint) : undefined)) ?? []

  return {
    foreignXdaiInformation: {
      dailyLimit: dailyLimit,
      executionDailyLimit: executionDailyLimit,
      minPerTx: minPerTx,
      maxPerTx: maxPerTx,
      executionMaxPerTx: executionMaxPerTx,
      totalSpentPerDay: totalSpentPerDay,
      totalExecutedPerDay: totalExecutedPerDay,
    },
  }
}
