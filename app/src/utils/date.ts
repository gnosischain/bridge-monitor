import sub from 'date-fns/sub'
import endOfDay from 'date-fns/endOfDay'
import startOfDay from 'date-fns/startOfDay'
import startOfHour from 'date-fns/startOfHour'

export const msToSeconds = (milliseconds: number) => {
  return Math.floor(milliseconds / 1000)
}

export const fromSecondsTimestamp = (timestamp: number) => parseInt(String(timestamp)) * 1000

export const DateFormated = (date: Date) => {
  const language = 'en-US'

  const day = date.getDate()
  const month = date.toLocaleString(language, { month: 'short' })
  const year = date.getFullYear()
  const hours = date.getHours()
  const minutes = String(date.getMinutes()).padStart(2, '0')

  return hours + ':' + minutes + ' on ' + day + ' ' + month + ', ' + year
}

export const getStartOfDay = () => startOfDay(new Date())
export const getEndOfDay = () => endOfDay(new Date())

/**
 * The lookback windows the validator-activity queries use as their `$after` bound, anchored to the
 * top of the current hour. Anchoring is what makes those queries shareable.
 */
export const get1DayBefore = () => sub(startOfHour(new Date()), { days: 1 })
export const get7DaysBefore = () => sub(startOfHour(new Date()), { days: 7 })
export const get1DayBeforeInSeconds = () => Math.round(get1DayBefore().getTime() / 1000)
export const get7DaysBeforeInSeconds = () => Math.round(get7DaysBefore().getTime() / 1000)
