import { useCallback, useEffect, useMemo, useState } from 'react'

export const useDate = (date: Date) => {
  const INTERVAL_TIME = 5000
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
  const epochs: Epoch[] = useMemo(
    () => [
      ['year', 31536000],
      ['month', 2592000],
      ['day', 86400],
      ['hour', 3600],
      ['min', 60],
      ['sec', 1],
    ],
    [],
  )

  const getDuration = useCallback(
    (timeInSeconds: number) => {
      return epochs
        .map((epoch) => {
          const interval = Math.floor(timeInSeconds / epoch[1])
          return {
            epoch: epoch[0],
            interval,
          }
        })
        .find((e) => e.interval >= 1)
    },
    [epochs],
  )

  const updateTime = useCallback(() => {
    const timeAgoInSeconds = Math.floor((Number(new Date()) - Number(new Date(date))) / 1000)
    const timeLeftInSeconds = Math.floor((Number(new Date(date)) - Number(new Date())) / 1000)
    setDuration(getDuration(timeAgoInSeconds))
    setRemaining(getDuration(timeLeftInSeconds))
  }, [date, getDuration])

  /**
   * Run only once, to set the initial time
   */
  useEffect(() => {
    updateTime()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  /**
   * Run every INTERVAL_TIME, to update the time
   */
  useEffect(() => {
    const intervals = setInterval(() => {
      updateTime()
    }, INTERVAL_TIME)
    return () => clearInterval(intervals)
  }, [updateTime])

  const getSuffix = useMemo(() => (duration?.interval === 1 ? '' : 's'), [duration])
  const getSuffixRemaining = useMemo(() => (remaining?.interval === 1 ? '' : 's'), [remaining])

  return { duration, getSuffix, remaining, getSuffixRemaining }
}
