import { useCallback, useState } from 'react'
export type TransactionFilter = {
  hash: string
  bridge: string
  status: string
  signedBy: string
  executedBy: string
  startTimestamp?: Date
  endTimestamp?: Date
  bridgeDirection: string
}

export const useTransactionsFilters = (init?: Partial<TransactionFilter>) => {
  const [hash, setHash] = useState(init?.hash || '')
  const [bridge, setBridge] = useState<string>(init?.bridge || '')
  const [status, setStatus] = useState<string>(init?.status || '')
  const [signedBy, setSignedBy] = useState<string>(init?.signedBy || '')
  const [executedBy, setExecutedBy] = useState<string>(init?.executedBy || '')
  const [startTimestamp, setStartTimestamp] = useState<Date | undefined>(init?.startTimestamp)
  const [endTimestamp, setEndTimestamp] = useState<Date | undefined>(init?.endTimestamp)
  const [bridgeDirection, setBridgeDirection] = useState<string>(init?.bridgeDirection || '')

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

  const resetFilters = useCallback((defaults: Partial<TransactionFilter>) => {
    setHash(defaults.hash || '')
    setBridge(defaults.bridge || '')
    setStatus(defaults.status || '')
    setSignedBy(defaults.signedBy || '')
    setExecutedBy(defaults.executedBy || '')
    setStartTimestamp(defaults.startTimestamp)
    setEndTimestamp(defaults.endTimestamp)
    setBridgeDirection(defaults.bridgeDirection || '')
  }, [])

  return {
    hash,
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
