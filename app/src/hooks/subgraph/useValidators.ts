import useSWR from 'swr'

import { BridgesValues } from '@/src/constants/config/bridges'
import { fetchExecutedTransactions, fetchSignedTransactions } from '@/src/utils/validators'
import { useHashi } from '@/src/hooks/useHashi'

export const useFetchValidatorsSignatures = (bridge: BridgesValues, afterDate: number) => {
  const {
    data,
    error,
    mutate: refetch,
  } = useSWR(['useFetchSignedTransactions', bridge, afterDate.toString()], () =>
    fetchSignedTransactions(bridge, afterDate),
  )

  const { getHashiSignedTransactions } = useHashi()

  const hashiSigned = getHashiSignedTransactions(afterDate, bridge)

  if (Array.isArray(data)) {
    const hashiIndex = data.findIndex((item) => item.name === 'Hashi')
    if (hashiIndex !== -1) {
      data[hashiIndex] = { ...data[hashiIndex], value: hashiSigned }
    }
  }

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
