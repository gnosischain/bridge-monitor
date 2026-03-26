import { fromSecondsTimestamp } from '@/src/utils/date'
import { chainsConfig } from '@/src/constants/config/chains'
import { Chains } from '@/src/constants/config/types'
import { Token } from '@/types/token'
import { getEnvioGraphqlClient } from '@/src/constants/config/indexer'
import { ENVIO_TRANSACTIONS_QUERY } from '@/src/queries/transactions'
import { constants } from 'ethers'

export enum TransactionStatus {
  Collecting = 'COLLECTING',
  Completed = 'COMPLETED',
  Error = 'ERROR',
  Initiated = 'INITIATED',
  Unclaimed = 'UNCLAIMED',
}
import { isSameString } from '@/src/utils/tools'

const GNOSIS = 'gnosis'
const MAINNET = 'mainnet'
const defaultRequestLimit = 1000

export type TransactionExecution = {
  id: string
  timestamp: number
  transactionHash: string
  validatorAddr?: string
  scanUrl?: string
}

export type TransactionValidation = {
  id: string
  timestamp: number
  transactionHash: string
  validatorAddr: string
  scanUrl?: string
}

export type Transaction = {
  id: string
  bridgeName: string
  transactionHash: string
  scanUrl?: string
  timestamp: number
  initiator: string
  initiatorAmount: string
  initiatorNetwork: string
  initiatorNetworkIcon?: string
  initiatorToken: string
  initiatorTokenData?: Token
  initiatorScanUrl: string
  receiver: string
  receiverAmount: string
  receiverNetwork: string
  receiverNetworkIcon?: string
  receiverToken: string
  receiverTokenData?: Token
  receiverScanUrl: string
  transactionStatus: TransactionStatus
  validations?: TransactionValidation[] | null
  execution?: TransactionExecution
  isClaiming?: boolean
}

export type TxsInMemoryFilters = { validator?: string; executor?: string }

export type EnvioQueryArgs = {
  where?: Record<string, unknown>
  order_by?: Array<{ timestamp: 'asc' | 'desc' }>
  limit?: number
  offset?: number
}

const getNetworkIcon = (network: string) => {
  return network === MAINNET ? 'eth' : 'gnosis'
}

const scanURL = (network: string) => {
  const chain = network.toLowerCase() === MAINNET ? Chains.mainnet : Chains.gnosis
  return chainsConfig[chain].blockExplorerUrls[0]
}

export const getTxScanUrl = (transactionHash: string, network: string) => {
  const baseURL = scanURL(network ?? MAINNET)
  return `${baseURL}tx/${transactionHash}`
}

export const getAddressScanUrl = (userAddress: string, network: string) => {
  const baseURL = scanURL(network ?? MAINNET)
  return userAddress ? `${baseURL}address/${userAddress}` : baseURL
}

const networkIdToName = (id?: number | null) => {
  if (id === 100) return 'gnosis'
  if (id === 1) return 'mainnet'
  return ''
}

const bridgeTypeToName = (bt?: string | null) => {
  if (!bt) return ''
  return bt.toUpperCase() === 'XDAI' ? 'xDai' : bt.toUpperCase()
}

const prepareTransactionForView = (row: EnvioTx): Transaction => {
  const initiatorNetwork = networkIdToName(row.initiatorNetwork)
  const receiverNetwork = networkIdToName(row.receiverNetwork)
  return {
    id: row.id,
    bridgeName: bridgeTypeToName(row.bridgeType),
    transactionHash: row.transactionHash ?? '',
    timestamp: fromSecondsTimestamp(row.timestamp ?? 0),
    initiator: row.initiator ?? '',
    initiatorAmount: row.initiatorAmount ?? constants.Zero.toString(),
    initiatorNetwork,
    initiatorNetworkIcon: getNetworkIcon(initiatorNetwork),
    initiatorToken: row.initiatorToken ?? '',
    receiver: row.receiver ?? '',
    receiverAmount: row.receiverAmount ?? constants.Zero.toString(),
    receiverNetwork,
    receiverNetworkIcon: getNetworkIcon(receiverNetwork),
    receiverToken: row.receiverToken ?? '',
    transactionStatus: (row.transactionStatus as TransactionStatus) ?? TransactionStatus.Initiated,
    validations: Array.isArray(row.validations)
      ? row.validations.map((v) => ({
          id: v.id,
          timestamp: fromSecondsTimestamp(v.timestamp),
          transactionHash: v.transactionHash,
          validatorAddr: v.validatorAddress,
          scanUrl: getTxScanUrl(v.transactionHash, GNOSIS),
        }))
      : [],
    execution: row.execution
      ? {
          id: row.execution.id,
          timestamp: fromSecondsTimestamp(row.execution.timestamp),
          transactionHash: row.execution.transactionHash,
          validatorAddr: row.execution.executorAddress ?? undefined,
          scanUrl: getTxScanUrl(row.execution.transactionHash, GNOSIS),
        }
      : undefined,
    scanUrl: getTxScanUrl(row.transactionHash ?? row.id, initiatorNetwork),
    initiatorScanUrl: getAddressScanUrl(row.initiator ?? '', initiatorNetwork),
    receiverScanUrl: getAddressScanUrl(row.receiver ?? '', receiverNetwork),
  }
}

type EnvioTx = {
  id: string
  bridgeType?: string | null
  transactionHash?: string | null
  timestamp?: number | null
  initiator?: string | null
  initiatorAmount?: string | null
  initiatorNetwork?: number | null
  initiatorToken?: string | null
  receiver?: string | null
  receiverToken?: string | null
  receiverAmount?: string | null
  receiverNetwork?: number | null
  transactionStatus?: string | null
  execution?: {
    id: string
    timestamp: number
    transactionHash: string
    executorAddress?: string | null
  } | null
  validations?: Array<{
    id: string
    timestamp: number
    transactionHash: string
    validatorAddress: string
  }>
}

export const fetchTransactions = async (
  query: EnvioQueryArgs,
  inMemoryFilters: TxsInMemoryFilters,
): Promise<Transaction[]> => {
  const request = getEnvioGraphqlClient<{ Transaction: Array<EnvioTx> }>()
  const res = await request(ENVIO_TRANSACTIONS_QUERY, {
    where: query.where,
    order_by: query.order_by,
    limit: query.limit ?? defaultRequestLimit,
    offset: query.offset ?? 0,
  })

  const safeRows = (res.Transaction || []).filter(
    (row) =>
      row?.id &&
      ((row?.initiatorNetwork !== null && row?.initiatorNetwork !== undefined) ||
        (row?.receiverNetwork !== null && row?.receiverNetwork !== undefined)),
  )

  let transactions = safeRows
  if (inMemoryFilters.validator) {
    transactions = transactions
      .filter((tx) => tx.validations && tx.validations.length > 0)
      .filter((tx) =>
        tx.validations?.some((v) =>
          isSameString(v.validatorAddress, inMemoryFilters.validator ?? ''),
        ),
      )
  }
  if (inMemoryFilters.executor) {
    transactions = transactions
      .filter((tx) => !!tx.execution?.executorAddress)
      .filter((tx) =>
        isSameString(tx.execution?.executorAddress ?? '', inMemoryFilters.executor ?? ''),
      )
  }

  return transactions.map(prepareTransactionForView)
}
