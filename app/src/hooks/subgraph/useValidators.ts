import useSWR from 'swr'

import { BridgesValues } from '@/src/constants/config/bridges'
import {
  fetchExecutedTransactions,
  fetchSignedTransactions,
  fetchValidators,
} from '@/src/utils/validators'

export const useFetchValidators = (bridge: string) => {
  const {
    data,
    error,
    mutate: refetch,
  } = useSWR(['useFetchValidators', bridge], () => fetchValidators(bridge))

  return { validators: data ?? [], error, refetch }
}

export const useFetchValidatorsSignatures = (bridge: BridgesValues, timePeriod: number) => {
  const {
    data,
    error,
    mutate: refetch,
  } = useSWR(['useFetchSignedTransactions', bridge, timePeriod.toString()], () =>
    fetchSignedTransactions(bridge, timePeriod),
  )
  return { data, error, refetch }
}

export const useFetchValidatorsExecutions = (bridge: BridgesValues, timePeriod: number) => {
  const {
    data,
    error,
    mutate: refetch,
  } = useSWR(['useFetchExecutedTransactions', bridge, timePeriod.toString()], () =>
    fetchExecutedTransactions(bridge, timePeriod),
  )
  return { data, error, refetch }
}
