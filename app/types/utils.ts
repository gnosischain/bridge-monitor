import { Contract } from '@ethersproject/contracts'
import { KeyedMutator } from 'swr'

export type ObjectValues<T> = T[keyof T]

export type Maybe<T> = T | null
export type RequiredNonNull<T> = { [P in keyof T]-?: NonNullable<T[P]> }
export type MySWRResponse<T> = [
  { data: Awaited<T>; error: null } | { data: null; error: Error },
  KeyedMutator<T>,
  boolean,
  boolean,
]
export type Writeable<T> = { -readonly [P in keyof T]: T[P] }

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type UnwrapReturnType<T> = T extends (...args: any) => any ? Awaited<ReturnType<T>> : never

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type UnwrapParametersType<T> = T extends (...args: any) => any ? Parameters<T> : never

export type TupleReturnType<MyContract extends Contract, Tuple extends unknown[]> = Tuple extends [
  infer Head,
  ...infer Tail,
]
  ? [UnwrapReturnType<Head>, ...TupleReturnType<MyContract, Tail>]
  : []

export type TupleParametersType<
  MyContract extends Contract,
  Tuple extends unknown[],
> = Tuple extends [infer Head, ...infer Tail]
  ? [UnwrapParametersType<Head>, ...TupleParametersType<MyContract, Tail>]
  : []

export const isFulfilled = <T>(
  input: PromiseSettledResult<T>,
): input is PromiseFulfilledResult<T> => input.status === 'fulfilled'
