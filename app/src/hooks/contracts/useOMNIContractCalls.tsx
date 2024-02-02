import { Chains } from '@/src/constants/config/types'
import { Token } from '@/types/token'
import { useContractCall } from '@/src/hooks/useContractCall'
import { useContractInstance } from '@/src/hooks/useContractInstance'
import { toNumber } from '@/src/utils/bigNumber'
import {
  ForeignOmniMediator,
  ForeignOmniMediator__factory,
  HomeOmniMediator,
  HomeOmniMediator__factory,
} from '@/types/typechain'
import { BigNumberish } from 'ethers'

export const useHomeOMNIBridgeLimits = (token: Token, currentDay: BigNumberish = '0') => {
  const tokenAddress = token.address
  const tokenAmountToNumber = toNumber(token.decimals)
  const homeOMNI = useContractInstance(HomeOmniMediator__factory, 'OmniBridge', Chains.gnosis)

  const contextCalls = [homeOMNI.getCurrentDay, homeOMNI.isTokenRegistered] as const
  const [{ data: homeOMNIContext }] = useContractCall<HomeOmniMediator, typeof contextCalls>(
    contextCalls,
    [[], [tokenAddress]],
    'homeOMNIContext',
  )
  const [, isTokenRegistered = false] = homeOMNIContext ?? []
  currentDay = homeOMNIContext?.[0] ?? currentDay

  const limitsCalls = [
    homeOMNI.dailyLimit,
    homeOMNI.executionDailyLimit,
    homeOMNI.minPerTx,
    homeOMNI.maxPerTx,
    homeOMNI.executionMaxPerTx,
  ] as const
  const [{ data: homeOMNILimits }] = useContractCall<HomeOmniMediator, typeof limitsCalls>(
    limitsCalls,
    [[tokenAddress], [tokenAddress], [tokenAddress], [tokenAddress], [tokenAddress]],
    'homeOMNILimits',
  )
  const [
    dailyLimit = 0,
    executionDailyLimit = 0,
    minPerTx = 0,
    maxPerTx = 0,
    executionMaxPerTx = 0,
  ] = homeOMNILimits?.map(tokenAmountToNumber) ?? []

  const totalsCalls = [homeOMNI.totalSpentPerDay, homeOMNI.totalExecutedPerDay] as const
  const [{ data: homeOMNITotals }] = useContractCall<HomeOmniMediator, typeof totalsCalls>(
    totalsCalls,
    [
      [tokenAddress, currentDay],
      [tokenAddress, currentDay],
    ],
    'homeOMNITotals',
  )
  const [totalSpentPerDay = 0, totalExecutedPerDay = 0] =
    homeOMNITotals?.map(tokenAmountToNumber) ?? []

  return {
    homeOmniInformation: {
      isTokenRegistered,
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

export const useForeignOMNIBridgeLimits = (token: Token, currentDay: BigNumberish = '0') => {
  const tokenAddress = token.address
  const tokenAmountToNumber = toNumber(token.decimals)
  const foreignOMNI = useContractInstance(
    ForeignOmniMediator__factory,
    'OmniBridge',
    Chains.mainnet,
  )

  const contextCalls = [foreignOMNI.getCurrentDay, foreignOMNI.isTokenRegistered] as const
  const [{ data: foreignOMNIContext }] = useContractCall<ForeignOmniMediator, typeof contextCalls>(
    contextCalls,
    [[], [tokenAddress]],
    'foreignOMNIContext',
  )
  currentDay = foreignOMNIContext?.[0] ?? currentDay
  const [, isTokenRegistered = false] = foreignOMNIContext ?? []

  const limitsCalls = [
    foreignOMNI.dailyLimit,
    foreignOMNI.executionDailyLimit,
    foreignOMNI.minPerTx,
    foreignOMNI.maxPerTx,
    foreignOMNI.executionMaxPerTx,
  ] as const
  const [{ data: foreignOMNILimits }] = useContractCall<ForeignOmniMediator, typeof limitsCalls>(
    limitsCalls,
    [[tokenAddress], [tokenAddress], [tokenAddress], [tokenAddress], [tokenAddress]],
    'foreignOMNILimits',
  )
  const [
    dailyLimit = 0,
    executionDailyLimit = 0,
    minPerTx = 0,
    maxPerTx = 0,
    executionMaxPerTx = 0,
  ] = foreignOMNILimits?.map(tokenAmountToNumber) ?? []

  const totalsCalls = [foreignOMNI.totalSpentPerDay, foreignOMNI.totalExecutedPerDay] as const
  const [{ data: foreignOMNITotals }] = useContractCall<ForeignOmniMediator, typeof totalsCalls>(
    totalsCalls,
    [
      [tokenAddress, currentDay],
      [tokenAddress, currentDay],
    ],
    'foreignOMNITotals',
  )
  const [totalSpentPerDay = 0, totalExecutedPerDay = 0] =
    foreignOMNITotals?.map(tokenAmountToNumber) ?? []

  return {
    foreignOmniInformation: {
      isTokenRegistered,
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
