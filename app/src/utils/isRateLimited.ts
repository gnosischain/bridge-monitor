import { BaseError, HttpRequestError } from 'viem'

export const isRateLimited = (error: unknown): boolean =>
  error instanceof BaseError &&
  !!error.walk((cause) => cause instanceof HttpRequestError && cause.status === 429)
