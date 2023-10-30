import { Chains } from '@/src/constants/config/types'
import { useContractCall } from '@/src/hooks/useContractCall'
import { useContractInstance } from '@/src/hooks/useContractInstance'
import { fromWei } from '@/src/utils/bigNumber'
import {
  ForeignBridgeErcToNative,
  ForeignBridgeErcToNative__factory,
  HomeBridgeErcToNative,
  HomeBridgeErcToNative__factory,
} from '@/types/typechain'
import { BigNumberish } from 'ethers'

export const useHomeXDAIBridgeLimits = (currentDay: BigNumberish = '0') => {
  const homeXDAI = useContractInstance(HomeBridgeErcToNative__factory, 'XDAI', Chains.gnosis)

  const contextCalls = [homeXDAI.getCurrentDay] as const
  const [{ data: homeXDAIContext }] = useContractCall<HomeBridgeErcToNative, typeof contextCalls>(
    contextCalls,
    [[]],
    'homeXDAIContext',
  )
  currentDay = homeXDAIContext?.[0] ?? currentDay

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
  const [
    dailyLimit = 0,
    executionDailyLimit = 0,
    minPerTx = 0,
    maxPerTx = 0,
    executionMaxPerTx = 0,
  ] = homeXDAILimits?.map(fromWei) ?? []

  const totalsCalls = [homeXDAI.totalSpentPerDay, homeXDAI.totalExecutedPerDay] as const
  const [{ data: homeXDAITotals }] = useContractCall<HomeBridgeErcToNative, typeof totalsCalls>(
    totalsCalls,
    [[currentDay], [currentDay]],
    'homeXDAITotals',
  )
  const [totalSpentPerDay = 0, totalExecutedPerDay = 0] = homeXDAITotals?.map(fromWei) ?? []

  return {
    homeXdaiInformation: {
      dailyLimit,
      totalSpentPerDay,
      executionDailyLimit,
      totalExecutedPerDay,
      minPerTx,
      maxPerTx,
      executionMaxPerTx,
    },
  }
}

export const useForeignXDAIBridgeLimits = (currentDay: BigNumberish = '0') => {
  const foreignXDAI = useContractInstance(ForeignBridgeErcToNative__factory, 'XDAI', Chains.gnosis)

  const contextCalls = [foreignXDAI.getCurrentDay] as const
  const [{ data: foreignXDAIContext }] = useContractCall<
    ForeignBridgeErcToNative,
    typeof contextCalls
  >(contextCalls, [[]], 'foreignXDAIContext')
  currentDay = foreignXDAIContext?.[0] ?? currentDay

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
  const [
    dailyLimit = 0,
    executionDailyLimit = 0,
    minPerTx = 0,
    maxPerTx = 0,
    executionMaxPerTx = 0,
  ] = foreignXDAILimits?.map(fromWei) ?? []

  const totalsCalls = [foreignXDAI.totalSpentPerDay, foreignXDAI.totalExecutedPerDay] as const
  const [{ data: foreignXDAITotals }] = useContractCall<
    ForeignBridgeErcToNative,
    typeof totalsCalls
  >(totalsCalls, [[currentDay], [currentDay]], 'foreignXDAITotals')
  const [totalSpentPerDay = 0, totalExecutedPerDay = 0] = foreignXDAITotals?.map(fromWei) ?? []

  return {
    foreignXdaiInformation: {
      dailyLimit,
      totalSpentPerDay,
      executionDailyLimit,
      totalExecutedPerDay,
      minPerTx,
      maxPerTx,
      executionMaxPerTx,
    },
  }
}
