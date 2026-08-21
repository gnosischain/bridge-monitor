import { useSuspenseQuery } from '@tanstack/react-query'

import { BridgesValues } from '@/src/constants/config/bridges'
import { fetchExecutedTransactions, fetchSignedTransactions } from '@/src/utils/validators'

export const useFetchValidatorsSignatures = (bridge: BridgesValues, afterDate: number) => {
  const { data, error, refetch } = useSuspenseQuery({
    queryKey: ['useFetchSignedTransactions', bridge, afterDate.toString()],
    queryFn: () => fetchSignedTransactions(bridge, afterDate),
    staleTime: 60_000,
  })

  return { data, error, refetch }
}

export const useFetchValidatorsExecutions = (bridge: BridgesValues, afterDate: number) => {
  const { data, error, refetch } = useSuspenseQuery({
    queryKey: ['useFetchExecutedTransactions', bridge, afterDate.toString()],
    queryFn: () => fetchExecutedTransactions(bridge, afterDate),
    staleTime: 60_000,
  })

  return { data, error, refetch }
}
