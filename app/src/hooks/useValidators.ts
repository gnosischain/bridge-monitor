import { useSuspenseQuery } from '@tanstack/react-query'

import { BridgesValues } from '@/src/constants/config/bridges'
import { ValidatorActivity, fetchValidatorsActivity } from '@/src/utils/validators'

/**
 * Per-validator count of the signatures or executions `bridge` saw since `afterDate` (in seconds).
 *
 * Suspends while loading and throws on failure: both are handled by the `genericSuspense` wrapper
 * around the calling component.
 */
export const useFetchValidatorsActivity = (
  bridge: BridgesValues,
  afterDate: number,
  activity: ValidatorActivity,
) =>
  useSuspenseQuery({
    queryKey: ['useFetchValidatorsActivity', activity, bridge, afterDate],
    queryFn: () => fetchValidatorsActivity(bridge, afterDate, activity),
    staleTime: 60_000,
  })
