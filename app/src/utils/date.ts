import { useEffect, useState } from 'react'
import sub from 'date-fns/sub'
import endOfDay from 'date-fns/endOfDay'
import startOfDay from 'date-fns/startOfDay'

export const DateFormat = (date: Date) => {
  const [duration, setDuration] = useState<
    { interval: number; epoch: string | number } | undefined
  >({ interval: 0, epoch: 'sec' })
  // Epochs
  const epochs = [
    ['year', 31536000],
    ['month', 2592000],
    ['day', 86400],
    ['hour', 3600],
    ['min', 60],
    ['sec', 1],
  ]
  // Get duration
  const getDuration = (timeAgoInSeconds: number) => {
    for (const [name, seconds] of epochs) {
      const interval = Math.floor(timeAgoInSeconds / Number(seconds))
      if (interval >= 1) {
        return {
          interval: interval,
          epoch: name,
        }
      }
    }
  }

  useEffect(() => {
    const interval = setInterval(() => {
      const timeAgoInSeconds = Math.floor((Number(new Date()) - Number(new Date(date))) / 1000)
      setDuration(getDuration(timeAgoInSeconds))
    }, 2000)
    return () => clearInterval(interval)
  })

  const suffix = duration?.interval === 1 ? '' : 's'

  return `${duration?.interval} ${duration?.epoch}${suffix} ago`
}

export const isToday = (someDate: Date) => new Date().toDateString() === someDate.toDateString()
export const isYesterday = (someDate: Date) => {
  const yesterday = new Date()
  yesterday.setDate(yesterday.getDate() - 1)
  return yesterday.toDateString() === someDate.toDateString()
}

export const toSeconds = (d: Date) => {
  return d.getTime()
}

export const msToSeconds = (milliseconds: number) => {
  return Math.floor(milliseconds / 1000)
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const fromSubgraphTimestamp = (timestamp: any) => parseInt(timestamp ?? '0') * 1000

export const DateFormated = (date: Date) => {
  const language = 'en-US'

  const day = date.getDate()
  const month = date.toLocaleString(language, { month: 'short' })
  const year = date.getFullYear()
  const hours = date.getHours()
  const minutes = String(date.getMinutes()).padStart(2, '0')

  return hours + ':' + minutes + ' on ' + day + ' ' + month + ', ' + year
}

export const dayHours: Array<{ key: string; value: number }> = [
  { key: '00:00 AM', value: 0 },
  { key: '01:00 AM', value: 1 },
  { key: '02:00 AM', value: 2 },
  { key: '03:00 AM', value: 3 },
  { key: '04:00 AM', value: 4 },
  { key: '05:00 AM', value: 5 },
  { key: '06:00 AM', value: 6 },
  { key: '07:00 AM', value: 7 },
  { key: '08:00 AM', value: 8 },
  { key: '09:00 AM', value: 9 },
  { key: '10:00 AM', value: 10 },
  { key: '11:00 AM', value: 11 },
  { key: '12:00 PM', value: 12 },
  { key: '01:00 PM', value: 13 },
  { key: '02:00 PM', value: 14 },
  { key: '03:00 PM', value: 15 },
  { key: '04:00 PM', value: 16 },
  { key: '05:00 PM', value: 17 },
  { key: '06:00 PM', value: 18 },
  { key: '07:00 PM', value: 19 },
  { key: '08:00 PM', value: 20 },
  { key: '09:00 PM', value: 21 },
  { key: '10:00 PM', value: 22 },
  { key: '11:00 PM', value: 23 },
]

export const transformDate = (date: string) => parseInt(date ?? '0') * 1000

export const getStartOfDay = () => startOfDay(new Date())
export const getEndOfDay = () => endOfDay(new Date())
export const get1DayBefore = () => sub(new Date(), { days: 1 })
export const get7DaysBefore = () => sub(new Date(), { days: 7 })
export const get1DayBeforeInSeconds = () => Math.round(get1DayBefore().getTime() / 1000)
export const get7DaysBeforeInSeconds = () => Math.round(get7DaysBefore().getTime() / 1000)
