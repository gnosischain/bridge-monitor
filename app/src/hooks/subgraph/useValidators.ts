import useSWR from 'swr'

import { BridgesValues } from '@/src/constants/config/bridges'
import {
  fetchExecutedTransactions,
  fetchSignedTransactions,
  fetchValidators,
} from '@/src/utils/validators'

export const useFetchValidators = (bridge?: string) => {
  const {
    data,
    error,
    mutate: refetch,
  } = useSWR(bridge ? ['useFetchValidators', bridge] : null, (a, _bridge) =>
    fetchValidators(_bridge),
  )

  return { validators: data ?? [], error, refetch }
}

export const useFetchValidatorsSignatures = (bridge: BridgesValues, afterDate: number) => {
  const {
    data,
    error,
    mutate: refetch,
  } = useSWR(['useFetchSignedTransactions', bridge, afterDate.toString()], () =>
    fetchSignedTransactions(bridge, afterDate),
  )
  return { data, error, refetch }
}

export const useFetchValidatorsExecutions = (bridge: BridgesValues, afterDate: number) => {
  const {
    data,
    error,
    mutate: refetch,
  } = useSWR(['useFetchExecutedTransactions', bridge, afterDate.toString()], () =>
    fetchExecutedTransactions(bridge, afterDate),
  )
  return { data, error, refetch }
}
