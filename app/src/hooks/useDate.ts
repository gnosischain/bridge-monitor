import { useEffect, useState } from 'react'

export const useDate = (date: Date) => {
  const INTERVAL_TIME = 2000
  type Epoch = [string, number]
  type EpochDuration = {
    epoch: string
    interval: number
  }

  const [duration, setDuration] = useState<EpochDuration | undefined>({ interval: 0, epoch: 'sec' })
  const [remaining, setRemaining] = useState<EpochDuration | undefined>({
    interval: 0,
    epoch: 'sec',
  })
  // Epochs
  const epochs: Epoch[] = [
    ['year', 31536000],
    ['month', 2592000],
    ['day', 86400],
    ['hour', 3600],
    ['min', 60],
    ['sec', 1],
  ]
  // Get duration
  const getDuration = (timeInSeconds: number) => {
    return epochs
      .map((epoch) => {
        const interval = Math.floor(timeInSeconds / epoch[1])
        return {
          epoch: epoch[0],
          interval,
        }
      })
      .find((e) => e.interval >= 1)
  }

  useEffect(() => {
    const intervals = setInterval(() => {
      const timeAgoInSeconds = Math.floor((Number(new Date()) - Number(new Date(date))) / 1000)
      const timeLeftInSeconds = Math.floor((Number(new Date(date)) - Number(new Date())) / 1000)
      setDuration(getDuration(timeAgoInSeconds))
      setRemaining(getDuration(timeLeftInSeconds))
    }, INTERVAL_TIME)
    return () => clearInterval(intervals)
  })

  const getSuffix = duration?.interval === 1 ? '' : 's'
  const getSuffixRemaining = remaining?.interval === 1 ? '' : 's'

  return { duration, getSuffix, remaining, getSuffixRemaining }
}
