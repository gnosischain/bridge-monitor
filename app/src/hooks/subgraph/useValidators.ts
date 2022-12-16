import useSWR from 'swr'

import { fetchValidators } from '@/src/utils/validators'

export const useFetchValidators = (bridge: string) => {
  const {
    data,
    error,
    mutate: refetch,
  } = useSWR(['useFetchValidators', bridge], () => fetchValidators(bridge))

  return { validators: data ?? [], error, refetch }
}
