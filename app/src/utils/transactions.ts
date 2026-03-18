import { fromSubgraphTimestamp } from '@/src/utils/date'
import { chainsConfig } from '@/src/constants/config/chains'
import { Chains } from '@/src/constants/config/types'
import { Token } from '@/types/token'
import { getEnvioGraphqlClient, isEnvioBackend } from '@/src/constants/config/indexer'
import { ENVIO_TRANSACTIONS_QUERY, TRANSACTION_QUERY } from '@/src/queries/transactions'
import {
  OrderDirection,
  QueryTransactionsArgs,
  TransactionExecution as TransactionExecutionSG,
  Transaction as TransactionSG,
  TransactionStatus,
  TransactionValidation as TransactionValidationSG,
  TransactionsQuery,
} from '@/types/generated/subgraph'
import { constants } from 'ethers'
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

const transformExecution = (
  txExecution?: TransactionExecutionSG,
): TransactionExecution | undefined => {
  if (!txExecution) return undefined
  return {
    id: txExecution.id,
    timestamp: fromSubgraphTimestamp(txExecution.timestamp),
    transactionHash: txExecution.transactionHash,
    validatorAddr: txExecution.validatorAddr,
    // @todo validators tx are only created in the GNOSIS network
    scanUrl: getTxScanUrl(txExecution.transactionHash, GNOSIS),
  }
}

const transformValidation = (txValidation: TransactionValidationSG): TransactionValidation => {
  return {
    id: txValidation.id,
    timestamp: fromSubgraphTimestamp(txValidation.timestamp),
    transactionHash: txValidation.transactionHash,
    validatorAddr: txValidation.validatorAddr,
    // @todo validators tx are only created in the GNOSIS network
    scanUrl: getTxScanUrl(txValidation.transactionHash, GNOSIS),
  }
}

const prepareTransactionForView = (tx: TransactionSG): Transaction => {
  const res = {
    id: tx.id,
    transactionHash: tx.transactionHash ?? '',
    bridgeName: tx.bridgeName ?? '',

    initiator: tx.initiator ?? '',
    initiatorAmount: tx.initiatorAmount || constants.Zero,
    initiatorNetwork: tx.initiatorNetwork ?? '',
    initiatorNetworkIcon: getNetworkIcon(tx.initiatorNetwork ?? ''),
    initiatorToken: tx.initiatorToken,

    receiver: tx.receiver,
    receiverAmount: tx.receiverAmount || constants.Zero,
    receiverNetwork: tx.receiverNetwork ?? '',
    receiverNetworkIcon: getNetworkIcon(tx.receiverNetwork ?? ''),
    receiverToken: tx.receiverToken,

    timestamp: fromSubgraphTimestamp(tx.timestamp),
    transactionStatus: tx.transactionStatus ?? TransactionStatus.Initiated,
    validations: tx.validations?.map(transformValidation),
    execution: transformExecution(tx.execution ?? undefined),

    scanUrl: getTxScanUrl(tx.transactionHash ?? tx.id, tx.initiatorNetwork ?? ''),
    initiatorScanUrl: getAddressScanUrl(tx.initiator, tx.initiatorNetwork ?? ''),
    receiverScanUrl: getAddressScanUrl(tx.receiver, tx.receiverNetwork ?? ''),
  }

  return res
}

const toEnvioWhere = (where?: unknown): Record<string, unknown> | undefined => {
  if (!where) return undefined
  type OrClause = { initiator?: unknown; receiver?: unknown }
  type InnerWhere = {
    timestamp_gte?: unknown
    timestamp_lte?: unknown
    transactionHash?: unknown
    initiatorNetwork?: unknown
    bridgeName?: unknown
    bridgeName_contains_nocase?: unknown
    or?: OrClause[]
  }
  type RawWhere = {
    id?: unknown
    transactionHash?: unknown
    timestamp_gte?: unknown
    timestamp_lte?: unknown
    or?: OrClause[]
    initiatorNetwork?: unknown
    bridgeName?: unknown
    bridgeName_contains_nocase?: unknown
    and?: InnerWhere[]
  }

  const w = where as RawWhere
  const andClauses: Array<Record<string, unknown>> = []

  // id equals
  if (w.id) {
    andClauses.push({ id: { _eq: String(w.id).toLowerCase() } })
  }

  // transactionHash equals
  if (w.transactionHash) {
    andClauses.push({ transactionHash: { _eq: String(w.transactionHash).toLowerCase() } })
  }

  // timestamp range
  if (w.timestamp_gte !== undefined) {
    andClauses.push({ timestamp: { _gte: Number(w.timestamp_gte) } })
  }
  if (w.timestamp_lte !== undefined) {
    andClauses.push({ timestamp: { _lte: Number(w.timestamp_lte) } })
  }

  // initiator/receiver OR search
  if (Array.isArray(w.or)) {
    const ors = w.or
      .map((cl: OrClause) => {
        if (typeof cl.initiator === 'string') {
          return {
            initiator: { _eq: cl.initiator.toLowerCase() },
          }
        }
        if (typeof cl.receiver === 'string') {
          return {
            receiver: { _eq: cl.receiver.toLowerCase() },
          }
        }
        return undefined
      })
      .filter(Boolean) as Array<Record<string, unknown>>
    if (ors.length) andClauses.push({ _or: ors })
  }

  // initiatorNetwork textual mapping
  if (w.initiatorNetwork) {
    const val = String(w.initiatorNetwork).toLowerCase()
    const num = val === 'gnosis' ? 100 : val === 'mainnet' ? 1 : undefined
    if (num !== undefined) andClauses.push({ initiatorNetwork: { _eq: num } })
  }

  // bridgeName -> bridgeType enum mapping
  const bridgeName = w.bridgeName || w.bridgeName_contains_nocase
  if (bridgeName) {
    const val = String(bridgeName).toUpperCase()
    const enumVal = val.includes('XDAI') ? 'XDAI' : 'AMB'
    andClauses.push({ bridgeType: { _eq: enumVal } })
  }

  // Combine explicit 'and' if present
  if (Array.isArray(w.and)) {
    w.and.forEach((inner: InnerWhere) => {
      if (inner.timestamp_gte !== undefined) {
        andClauses.push({ timestamp: { _gte: Number(inner.timestamp_gte) } })
      }
      if (inner.timestamp_lte !== undefined) {
        andClauses.push({ timestamp: { _lte: Number(inner.timestamp_lte) } })
      }
      if (inner.transactionHash) {
        andClauses.push({ transactionHash: { _eq: String(inner.transactionHash).toLowerCase() } })
      }
      if (inner.initiatorNetwork) {
        const val = String(inner.initiatorNetwork).toLowerCase()
        const num = val === 'gnosis' ? 100 : val === 'mainnet' ? 1 : undefined
        if (num !== undefined) andClauses.push({ initiatorNetwork: { _eq: num } })
      }
      const innerBridge = inner.bridgeName || inner.bridgeName_contains_nocase
      if (innerBridge) {
        const val = String(innerBridge).toUpperCase()
        const enumVal = val.includes('XDAI') ? 'XDAI' : 'AMB'
        andClauses.push({ bridgeType: { _eq: enumVal } })
      }
      if (Array.isArray(inner.or)) {
        const ors = inner.or
          .map((cl: OrClause) => {
            if (typeof cl.initiator === 'string') {
              return {
                initiator: { _eq: cl.initiator.toLowerCase() },
              }
            }
            if (typeof cl.receiver === 'string') {
              return {
                receiver: { _eq: cl.receiver.toLowerCase() },
              }
            }
            return undefined
          })
          .filter(Boolean) as Array<Record<string, unknown>>
        if (ors.length) andClauses.push({ _or: ors })
      }
    })
  }

  return andClauses.length ? { _and: andClauses } : undefined
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

const fetchTransactionsEnvio = async (
  query: QueryTransactionsArgs,
  inMemoryFilters: TxsInMemoryFilters,
) => {
  const where = toEnvioWhere(query?.where)
  const order_by =
    query?.orderDirection === OrderDirection.Desc
      ? [{ timestamp: 'desc' as const }]
      : [{ timestamp: 'asc' as const }]
  const limit = query?.first ?? defaultRequestLimit
  const offset = query?.skip ?? 0

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
  const request = getEnvioGraphqlClient<{
    Transaction: Array<EnvioTx>
  }>()
  const res = await request(ENVIO_TRANSACTIONS_QUERY, {
    where,
    order_by,
    limit,
    offset,
  })

  // Drop malformed rows early (skip problematic transactions)
  const safeRows = (res.Transaction || []).filter(
    (row: EnvioTx) =>
      row?.id &&
      ((row?.initiatorNetwork !== null && row?.initiatorNetwork !== undefined) ||
        (row?.receiverNetwork !== null && row?.receiverNetwork !== undefined)),
  )

  // Map to subgraph-like TransactionSG for reuse of prepareTransactionForView.
  const sgRows: TransactionSG[] = safeRows.map((row: EnvioTx) => {
    return {
      __typename: 'Transaction' as const,
      id: row.id,
      bridgeName: bridgeTypeToName(row.bridgeType),
      transactionHash: row.transactionHash ?? '',
      timestamp: row.timestamp ?? 0,
      initiator: row.initiator ?? '',
      initiatorAmount: row.initiatorAmount ?? '0',
      initiatorNetwork: networkIdToName(row.initiatorNetwork),
      initiatorToken: row.initiatorToken ?? '',
      receiver: row.receiver ?? '',
      receiverToken: row.receiverToken ?? '',
      receiverAmount: row.receiverAmount ?? '0',
      receiverNetwork: networkIdToName(row.receiverNetwork),
      transactionStatus: row.transactionStatus,
      execution: row.execution
        ? {
          __typename: 'TransactionExecution' as const,
          id: row.execution.id,
          timestamp: row.execution.timestamp,
          transactionHash: row.execution.transactionHash,
          // map executorAddress -> validatorAddr
          validatorAddr: row.execution.executorAddress,
        }
        : null,
      validations: Array.isArray(row.validations)
        ? row.validations.map((v) => ({
          __typename: 'TransactionValidation' as const,
          id: v.id,
          timestamp: v.timestamp,
          transactionHash: v.transactionHash,
          validatorAddr: v.validatorAddress,
        }))
        : [],
    } as unknown as TransactionSG
  })

  // In-memory filters for validator/executor
  let transactions = sgRows
  if (inMemoryFilters.validator) {
    transactions = transactions
      .filter((tx) => tx.validations && tx.validations.length > 0)
      .filter((tx) =>
        tx.validations?.some((v) => isSameString(v.validatorAddr, inMemoryFilters.validator ?? '')),
      )
  }
  if (inMemoryFilters.executor) {
    transactions = transactions
      .filter((tx) => !!tx.execution?.validatorAddr)
      .filter((tx) =>
        isSameString(tx.execution?.validatorAddr ?? '', inMemoryFilters.executor ?? ''),
      )
  }

  return transactions.map(prepareTransactionForView)
}

export const fetchTransactions = async (
  query: QueryTransactionsArgs,
  inMemoryFilters: TxsInMemoryFilters,
) => {
  if (isEnvioBackend()) {
    return fetchTransactionsEnvio(query, inMemoryFilters)
  }
}
