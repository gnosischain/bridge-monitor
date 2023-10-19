import { useRouter } from 'next/router'

/**
 * retrieves query param 'd' to set currentDay
 * a helper param to set the current day for historical data
 * @returns string | undefined
 */
export const useDayNumber = (): string | undefined => {
  const {
    query: { d },
  } = useRouter()
  if (typeof d === 'string' || typeof d === 'undefined') {
    return d
  }

  throw new Error('query param "d" is invalid')
}
