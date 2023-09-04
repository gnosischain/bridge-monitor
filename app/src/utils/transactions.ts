import { fromSubgraphTimestamp } from './date'
import { chainsConfig } from '../constants/config/chains'
import { Chains } from '../constants/config/types'
import { Token } from '../constants/token'
import { getForeignGraphqlClient, getHomeGraphqlClient } from '@/src/constants/config/subgraph'
import { TRANSACTION_QUERY } from '@/src/queries/transactions'
import {
  // OrderDirection,
  TransactionExecution as TransactionExecutionSG,
  Transaction as TransactionSG,
  TransactionStatus,
  TransactionValidation as TransactionValidationSG,
  // Transaction_OrderBy,
  TransactionsQuery,
  TransactionsQueryVariables,
} from '@/types/generated/subgraph'
import { FixedNumber, constants } from 'ethers'

const GNOSIS = 'gnosis'
const MAINNET = 'mainnet'

// const MAX_RESULTS = 800
// const RESULTS_ORDER = OrderDirection.Desc
// const ORDER_BY = Transaction_OrderBy.Timestamp

export type TransactionExecution = {
  id: string
  timestamp: number
  transactionHash: string
  responsableAddress: string
  scanUrl?: string
}

export type TransactionValidation = {
  id: string
  timestamp: number
  transactionHash: string
  responsableAddress: string
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
}

const getNetworkIcon = (network: string) => {
  return network === MAINNET ? 'eth' : 'gnosis'
}

const scanURL = (network: string) => {
  const chain = network === MAINNET ? Chains.mainnet : Chains.gnosis
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
    responsableAddress: txExecution.responsableAddress,
    // @todo validators tx are only created in the GNOSIS network
    scanUrl: getTxScanUrl(txExecution.transactionHash, GNOSIS),
  }
}

const transformValidation = (txValidation: TransactionValidationSG): TransactionValidation => {
  return {
    id: txValidation.id,
    timestamp: fromSubgraphTimestamp(txValidation.timestamp),
    transactionHash: txValidation.transactionHash,
    responsableAddress: txValidation.responsableAddress,
    // @todo validators tx are only created in the GNOSIS network
    scanUrl: getTxScanUrl(txValidation.transactionHash, GNOSIS),
  }
}

const transformTx = (tx: TransactionSG): Transaction => {
  const res = {
    id: tx.id,
    // @todo tx from subgraph should return their transactionHash
    transactionHash: tx.transactionHash ?? tx.id,
    bridgeName: tx.bridgeName ?? '',

    initiator: tx.initiator ?? '',
    initiatorAmount: FixedNumber.fromValue(tx.initiatorAmount || constants.Zero, 18)
      .round(12)
      .toString(),
    initiatorNetwork: tx.initiatorNetwork ?? '',
    initiatorNetworkIcon: getNetworkIcon(tx.initiatorNetwork ?? ''),
    initiatorToken: tx.initiatorToken,

    receiver: tx.receiver,
    receiverAmount: FixedNumber.fromValue(tx.receiverAmount || constants.Zero, 18)
      .round(12)
      .toString(),
    receiverNetwork: tx.receiverNetwork ?? '',
    receiverNetworkIcon: getNetworkIcon(tx.receiverNetwork ?? ''),
    receiverToken: tx.receiverToken,

    timestamp: fromSubgraphTimestamp(tx.timestamp),
    transactionStatus: tx.transactionStatus ?? TransactionStatus.Initiated,
    validations: tx.validations?.map(transformValidation),
    execution: transformExecution(tx.execution ?? undefined),

    // @todo tx from subgraph should return their transactionHash
    scanUrl: getTxScanUrl(tx.transactionHash ?? tx.id, tx.initiatorNetwork ?? ''),
    initiatorScanUrl: getAddressScanUrl(tx.initiator, tx.initiatorNetwork ?? ''),
    receiverScanUrl: getAddressScanUrl(tx.receiver, tx.receiverNetwork ?? ''),
  }
  return res
}

const fetchHomeTransaction = async (query?: TransactionsQueryVariables) => {
  const { transactions } = await getHomeGraphqlClient()<
    TransactionsQuery,
    TransactionsQueryVariables
  >(TRANSACTION_QUERY, query)
  return transactions
}

const fetchForeignTransaction = async (query?: TransactionsQueryVariables) => {
  const { transactions } = await getForeignGraphqlClient()<
    TransactionsQuery,
    TransactionsQueryVariables
  >(TRANSACTION_QUERY, query)
  return transactions
}

export const unifyTransactions = async (homeTxs: TransactionSG[], foreignTxs: TransactionSG[]) => {
  const transactions: Record<string, TransactionSG> = homeTxs.reduce((acc, tx) => {
    acc[tx.id] = tx
    return acc
  }, {} as Record<string, TransactionSG>)

  // There is a special case where the tx is completed in one side, but due it might be filtered out in the other side
  // because of the date it has been completed.
  // For example:
  // filter = 1/1/2024-1/2/2024
  // it brings all the txs that have "initiated" in home and all the txs that have been "claimed" in foreign
  // this scenario sometimes bring txs in foreign that are not in home.
  // We take the txs ids that aren't in home and fetch them in foreign manually.
  const missingHomeTxs = foreignTxs
    .filter((tx) => tx.transactionStatus == TransactionStatus.Completed)
    .filter((tx) => !transactions[tx.id])
    .map((tx) => tx.id)

  if (missingHomeTxs.length > 0) {
    const completedTxs = (await fetchHomeTransaction({
      where: { id_in: missingHomeTxs },
    })) as TransactionSG[]

    completedTxs.forEach((tx) => {
      transactions[tx.id] = tx
    })
  }

  // we add to the transactions the information provided by the foreign request.
  foreignTxs.forEach((foreignTx) => {
    if (!transactions[foreignTx.id]) {
      transactions[foreignTx.id] = foreignTx
    } else {
      const completedTx = transactions[foreignTx.id]

      if (foreignTx.initiatorNetwork == 'gnosis') {
        // when the tx is finalized in foreign
        completedTx.receiver = foreignTx.receiver
        completedTx.receiverNetwork = foreignTx.receiverNetwork
        completedTx.receiverAmount = foreignTx.receiverAmount
        completedTx.receiverToken = foreignTx.receiverToken
      } else {
        // when the tx is initiated in foreign
        completedTx.transactionHash = foreignTx.transactionHash
        completedTx.initiator = foreignTx.initiator
        completedTx.initiatorAmount = foreignTx.initiatorAmount
        completedTx.initiatorNetwork = foreignTx.initiatorNetwork
        completedTx.initiatorToken = foreignTx.initiatorToken
      }

      // set claim tx data
      if (foreignTx.transactionStatus === 'COMPLETED') {
        completedTx.transactionStatus = TransactionStatus.Completed
        completedTx.execution = foreignTx.execution
      }
    }
  })

  return Object.values(transactions)
}

export const fetchTransactions = async (query: TransactionsQueryVariables) => {
  const [homeTxs, foreignTxs] = await Promise.all([
    fetchHomeTransaction(query),
    fetchForeignTransaction(query),
  ])

  const transactions = await unifyTransactions(
    homeTxs as TransactionSG[],
    foreignTxs as TransactionSG[],
  )

  const res = transactions.map(transformTx)
  return res
}
