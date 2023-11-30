import useSWR from 'swr'

import { BridgesValues } from '@/src/constants/config/bridges'
import { fetchExecutedTransactions, fetchSignedTransactions } from '@/src/utils/validators'

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
