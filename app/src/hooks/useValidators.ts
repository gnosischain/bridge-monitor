import { useSuspenseQuery } from '@tanstack/react-query'

import { BridgesValues } from '@/src/constants/config/bridges'
import {
  ValidatorActivity,
  countValidatorsActivity,
  fetchValidatorsActivity,
} from '@/src/utils/validators'

/**
 * Per-validator count of the signatures or executions `bridge` saw since `afterDate` (in seconds).
 *
 * Every bridge and activity reads the same rows, so they share one request per `afterDate`.
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
    queryKey: ['useFetchValidatorsActivity', afterDate],
    queryFn: () => fetchValidatorsActivity(afterDate),
    select: (validators) => countValidatorsActivity(validators, bridge, activity),
    staleTime: 60_000,
  })
