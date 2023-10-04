import { useCallback, useState } from 'react'

import { today, yesterday } from '../utils/date'

export type TransactionFilter = {
  hash: string
  bridge: string
  status: string
  signedBy: string
  executedBy: string
  startTimestamp: Date
  endTimestamp: Date
  bridgeDirection: string
}

export const useTransactionsFilters = () => {
  const [hash, setHash] = useState('')
  const [bridge, setBridge] = useState<string>('XDAI')
  const [status, setStatus] = useState<string>('')
  const [signedBy, setSignedBy] = useState<string>('')
  const [executedBy, setExecutedBy] = useState<string>('')
  const [startTimestamp, setStartTimestamp] = useState<Date>(yesterday())
  const [endTimestamp, setEndTimestamp] = useState<Date>(new Date())
  const [bridgeDirection, setBridgeDirection] = useState<string>('')

  const filters: TransactionFilter = {
    hash,
    bridge,
    bridgeDirection,
    status,
    signedBy,
    executedBy,
    startTimestamp,
    endTimestamp,
  }

  const resetFilters = useCallback(() => {
    setHash('')
    setBridge('XDAI')
    setStatus('')
    setSignedBy('')
    setExecutedBy('')
    setStartTimestamp(yesterday())
    setEndTimestamp(today())
    setBridgeDirection('')
  }, [])

  return {
    setHash,
    setBridge,
    setBridgeDirection,
    setStatus,
    setSignedBy,
    setExecutedBy,
    setStartTimestamp,
    setEndTimestamp,
    resetFilters,
    filters,
  }
}
