import { useContractCall } from '@/src/hooks/useContractCall'
import { useContractInstance } from '@/src/hooks/useContractInstance'
import { fromBNtoNumber } from '@/src/utils/bigNumber'
import {
  ForeignBridgeErcToNative,
  ForeignBridgeErcToNative__factory,
  HomeBridgeErcToNative,
  HomeBridgeErcToNative__factory,
} from '@/types/typechain'

export const useHomeXDAIBridgeLimits = () => {
  const homeXDAI = useContractInstance(HomeBridgeErcToNative__factory, 'XDAI', 100)

  const contextCalls = [homeXDAI.owner, homeXDAI.getCurrentDay] as const
  const [{ data: homeXDAIContext }] = useContractCall<HomeBridgeErcToNative, typeof contextCalls>(
    contextCalls,
    [[], []],
    'homeXDAIContext',
  )

  const limitsCalls = [
    homeXDAI.dailyLimit,
    homeXDAI.executionDailyLimit,
    homeXDAI.minPerTx,
    homeXDAI.maxPerTx,
    homeXDAI.executionMaxPerTx,
  ] as const
  const [{ data: homeXDAILimits }] = useContractCall<HomeBridgeErcToNative, typeof limitsCalls>(
    limitsCalls,
    [[], [], [], [], []],
    'homeXDAILimits',
  )

  const currentDay = homeXDAIContext?.[1] ?? 0
  const totalsCalls = [homeXDAI.totalSpentPerDay, homeXDAI.totalExecutedPerDay] as const
  const [{ data: homeXDAITotals }] = useContractCall<HomeBridgeErcToNative, typeof totalsCalls>(
    totalsCalls,
    [[currentDay], [currentDay]],
    'homeXDAITotals',
  )

  const homeXDAIBridgeInformation = {
    homeXDAIinformation: {
      dailyLimit: fromBNtoNumber(homeXDAILimits?.[0]) ?? 0,
      totalSpentPerDay: fromBNtoNumber(homeXDAITotals?.[0]) ?? 0,
      executionDailyLimit: fromBNtoNumber(homeXDAILimits?.[1]) ?? 0,
      totalExecutedPerDay: fromBNtoNumber(homeXDAITotals?.[1]) ?? 0,
      minPerTx: fromBNtoNumber(homeXDAILimits?.[2]) ?? 0,
      maxPerTx: fromBNtoNumber(homeXDAILimits?.[3]) ?? 0,
      executionMaxPerTx: fromBNtoNumber(homeXDAILimits?.[4]) ?? 0,
    },
  }
  return homeXDAIBridgeInformation
}

export const useForeignXDAIBridgeLimits = () => {
  const foreignXDAI = useContractInstance(ForeignBridgeErcToNative__factory, 'XDAI')

  const contextCalls = [foreignXDAI.owner, foreignXDAI.getCurrentDay] as const
  const [{ data: foreignXDAIContext }] = useContractCall<
    ForeignBridgeErcToNative,
    typeof contextCalls
  >(contextCalls, [[], []], 'foreignXDAIContext')

  const limitsCalls = [
    foreignXDAI.dailyLimit,
    foreignXDAI.executionDailyLimit,
    foreignXDAI.minPerTx,
    foreignXDAI.maxPerTx,
    foreignXDAI.executionMaxPerTx,
  ] as const
  const [{ data: foreignXDAILimits }] = useContractCall<
    ForeignBridgeErcToNative,
    typeof limitsCalls
  >(limitsCalls, [[], [], [], [], []], 'foreignXDAILimits')

  const currentDay = foreignXDAIContext?.[1] ?? '0'
  const totalsCalls = [foreignXDAI.totalSpentPerDay, foreignXDAI.totalExecutedPerDay] as const
  const [{ data: foreignXDAITotals }] = useContractCall<
    ForeignBridgeErcToNative,
    typeof totalsCalls
  >(totalsCalls, [[currentDay], [currentDay]], 'foreignXDAITotals')

  const foreignXDAIBridgeInformation = {
    foreignXDAIinformation: {
      dailyLimit: fromBNtoNumber(foreignXDAILimits?.[0]) ?? 0,
      totalSpentPerDay: fromBNtoNumber(foreignXDAITotals?.[0]) ?? 0,
      executionDailyLimit: fromBNtoNumber(foreignXDAILimits?.[1]) ?? 0,
      totalExecutedPerDay: fromBNtoNumber(foreignXDAITotals?.[1]) ?? 0,
      minPerTx: fromBNtoNumber(foreignXDAILimits?.[2]) ?? 0,
      maxPerTx: fromBNtoNumber(foreignXDAILimits?.[3]) ?? 0,
      executionMaxPerTx: fromBNtoNumber(foreignXDAILimits?.[4]) ?? 0,
    },
  }
  return foreignXDAIBridgeInformation
}
