import { useState } from 'react'

import { yesterday } from '../utils/date'

export type TransactionFilter = {
  hash: string
  bridge: string
  status: string
  signatureBy: string
  executedBy: string
  startTimestamp: Date
  endTimestamp: Date
}

export const useTransactionsFilters = () => {
  const [hash, setHash] = useState('')
  const [bridge, setBridge] = useState<string>('')
  const [status, setStatus] = useState<string>('')
  const [signatureBy, setSignatureBy] = useState<string>('')
  const [executedBy, setExecutedBy] = useState<string>('')
  const [startTimestamp, setStartTimestamp] = useState<Date>(yesterday())
  const [endTimestamp, setEndTimestamp] = useState<Date>(new Date())

  const filters: TransactionFilter = {
    hash,
    bridge,
    status,
    signatureBy,
    executedBy,
    startTimestamp,
    endTimestamp,
  }

  return {
    setHash,
    setBridge,
    setStatus,
    setSignatureBy,
    setExecutedBy,
    setStartTimestamp,
    setEndTimestamp,
    filters,
  }
}
