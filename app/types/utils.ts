export type ObjectValues<T> = T[keyof T]

export type Maybe<T> = T | null

export const isFulfilled = <T>(
  input: PromiseSettledResult<T>,
): input is PromiseFulfilledResult<T> => input.status === 'fulfilled'

export type Nullable<T> = T | null
export type Nullish<T> = Nullable<T> | undefined
