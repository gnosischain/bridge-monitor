import { useEffect, useState } from 'react'

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

export const yesterday = () => {
  const d = new Date()
  d.setDate(d.getDate() - 1)
  return d
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

export const milliToSeconds = (milliseconds: number) => {
  return Math.floor(milliseconds / 1000)
}

export const fromSubgraphTimestamp = (timestamp: any) => parseInt(timestamp ?? '0') * 1000
