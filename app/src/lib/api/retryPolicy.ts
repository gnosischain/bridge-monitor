import { ClientError } from 'graphql-request'
import { BaseError } from 'viem'

/** Retries per query for a non-deterministic failure; matches TanStack's own `retry: 3` default. */
const RETRY_COUNT = 3

/**
 * TanStack Query `retry` predicate. `failureCount` starts at 0 and is incremented only after this
 * returns, so `< RETRY_COUNT` yields exactly `RETRY_COUNT` retries.
 */
export const shouldRetryQuery = (failureCount: number, error: unknown) => {
  if (failureCount >= RETRY_COUNT) return false

  if (error instanceof BaseError) return false

  // A 429 is the indexer's rate limit: as transient as a 5xx, so worth the same retries.
  if (error instanceof ClientError) {
    const { status } = error.response
    return status === 429 || status >= 500
  }

  return true
}
