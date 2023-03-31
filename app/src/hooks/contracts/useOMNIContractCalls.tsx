import { Chains, ChainsValues } from '@/src/constants/config/types'
import { Token } from '@/src/constants/token'
import { useContractCall } from '@/src/hooks/useContractCall'
import { useContractInstance } from '@/src/hooks/useContractInstance'
import { fromBNtoNumber } from '@/src/utils/bigNumber'
import {
  ForeignOmniMediator,
  ForeignOmniMediator__factory,
  HomeOmniMediator,
  HomeOmniMediator__factory,
} from '@/types/typechain'

export const useHomeOMNIBridgeLimits = (token: Token) => {
  const chainId: ChainsValues = Chains.gnosis
  const tokenAddress = token.address
  const decimals = token.decimals
  const homeOMNI = useContractInstance(HomeOmniMediator__factory, 'OMNI', chainId)

  const contextCalls = [homeOMNI.owner, homeOMNI.getCurrentDay, homeOMNI.isTokenRegistered] as const
  const [{ data: homeOMNIContext }] = useContractCall<HomeOmniMediator, typeof contextCalls>(
    contextCalls,
    [[], [], [tokenAddress]],
    'homeOMNIContext',
  )
  console.log('homeOMNIContext ', { homeOMNIContext })

  const registeredToken: boolean = homeOMNIContext?.[2] ?? false

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
  console.log('homeOMNILimits ', { homeOMNILimits })

  const currentDay = homeOMNIContext?.[1] ?? 0
  console.log('currentDay ', currentDay)
  const totalsCalls = [homeOMNI.totalSpentPerDay, homeOMNI.totalExecutedPerDay] as const
  const [{ data: homeOMNITotals }] = useContractCall<HomeOmniMediator, typeof totalsCalls>(
    totalsCalls,
    [
      [tokenAddress, currentDay],
      [tokenAddress, currentDay],
    ],
    'homeOMNITotals',
  )

  return {
    homeOMNIinformation: {
      isTokenRegistered: registeredToken,
      dailyLimit: fromBNtoNumber(homeOMNILimits?.[0], decimals) ?? 0,
      totalSpentPerDay: fromBNtoNumber(homeOMNITotals?.[0], decimals) ?? 0,
      executionDailyLimit: fromBNtoNumber(homeOMNILimits?.[1], decimals) ?? 0,
      totalExecutedPerDay: fromBNtoNumber(homeOMNITotals?.[1], decimals) ?? 0,
      minPerTx: fromBNtoNumber(homeOMNILimits?.[2], decimals) ?? 0,
      maxPerTx: fromBNtoNumber(homeOMNILimits?.[3], decimals) ?? 0,
      executionMaxPerTx: fromBNtoNumber(homeOMNILimits?.[4], decimals) ?? 0,
    },
  }
}

export const useForeignOMNIBridgeLimits = (token: Token) => {
  const chainId: ChainsValues = Chains.mainnet
  const tokenAddress = token.address
  const decimals = token.decimals
  const foreignOMNI = useContractInstance(ForeignOmniMediator__factory, 'OMNI', chainId)

  const contextCalls = [
    foreignOMNI.owner,
    foreignOMNI.getCurrentDay,
    foreignOMNI.isTokenRegistered,
  ] as const
  const [{ data: foreignOMNIContext }] = useContractCall<ForeignOmniMediator, typeof contextCalls>(
    contextCalls,
    [[], [], [tokenAddress]],
    'foreignOMNIContext',
  )

  const registeredToken: boolean = foreignOMNIContext?.[2] ?? false

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

  const currentDay = foreignOMNIContext?.[1] ?? '0'
  const totalsCalls = [foreignOMNI.totalSpentPerDay, foreignOMNI.totalExecutedPerDay] as const
  const [{ data: foreignOMNITotals }] = useContractCall<ForeignOmniMediator, typeof totalsCalls>(
    totalsCalls,
    [
      [tokenAddress, currentDay],
      [tokenAddress, currentDay],
    ],
    'foreignOMNITotals',
  )
  console.log('registeredToken ', registeredToken)
  console.log('minPerTx (no decimals):', fromBNtoNumber(foreignOMNILimits?.[2]))
  console.log('minPerTx (withDecimals):', fromBNtoNumber(foreignOMNILimits?.[2], decimals))
  console.log('maxPerTx (no decimals):', fromBNtoNumber(foreignOMNILimits?.[3]))
  console.log('maxPerTx (withDecimals):', fromBNtoNumber(foreignOMNILimits?.[3], decimals))
  console.log('executionMaxPerTx:', fromBNtoNumber(foreignOMNILimits?.[4], decimals))

  return {
    foreignOMNIinformation: {
      isTokenRegistered: registeredToken,
      dailyLimit: fromBNtoNumber(foreignOMNILimits?.[0], decimals) ?? 0,
      totalSpentPerDay: fromBNtoNumber(foreignOMNITotals?.[0], decimals) ?? 0,
      executionDailyLimit: fromBNtoNumber(foreignOMNILimits?.[1], decimals) ?? 0,
      totalExecutedPerDay: fromBNtoNumber(foreignOMNITotals?.[1], decimals) ?? 0,
      minPerTx: fromBNtoNumber(foreignOMNILimits?.[2], decimals) ?? 0,
      maxPerTx: fromBNtoNumber(foreignOMNILimits?.[3], decimals) ?? 0,
      executionMaxPerTx: fromBNtoNumber(foreignOMNILimits?.[4], decimals) ?? 0,
    },
  }
}
