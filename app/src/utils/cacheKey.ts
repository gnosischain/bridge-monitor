// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type CacheKey<T extends any[]> = {
  [Key in keyof T]: T[Key] extends null ? undefined : T[Key] extends bigint ? string : T[Key]
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default function getCacheKey<T extends any[]>(args: T): CacheKey<T> {
  const key = args.map((arg) => {
    if (arg === null || arg === undefined) {
      return 'null'
    } else {
      return arg.toString()
    }
  })
  return key as CacheKey<T>
}
