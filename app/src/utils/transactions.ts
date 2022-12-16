import { chainsConfig } from '../constants/config/chains'
import { Chains } from '../constants/config/types'
import { Token, tokens } from '../constants/token'
import { fromBNtoNumber } from './bigNumber'
import { fromSubgraphTimestamp } from './date'
import { formatNumber } from './formatNumber'
import { getForeignGraphqlClient, getHomeGraphqlClient } from '@/src/constants/config/subgraph'
import { TRANSACTION_QUERY } from '@/src/queries/transactions'
import {
  TransactionExecution as TransactionExecutionSG,
  Transaction as TransactionSG,
  TransactionStatus,
  TransactionValidation as TransactionValidationSG,
  TransactionsQuery,
  TransactionsQueryVariables,
} from '@/types/generated/subgraph'

const GNOSIS = 'xdai'
const MAINNET = 'mainnet'

export type TransactionExecution = {
  id: string
  timestamp: number
  transactionHash: string
  executorAddress: string
  scanUrl?: string
}

export type TransactionValidation = {
  id: string
  timestamp: number
  transactionHash: string
  validatorAddress: string
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
  validations: TransactionValidation[]
  execution?: TransactionExecution
}

const getNetworkIcon = (network: string) => {
  return network === MAINNET ? '/images/icons/eth.png' : '/images/icons/gnosis.png'
}

const getTokenData = (network: string) => {
  if (network === MAINNET) return tokens['DAI']
  return tokens['XDAI']
}

const scanURL = (network: string) => {
  const chain = network === MAINNET ? Chains.mainnet : Chains.xdai
  return chainsConfig[chain].blockExplorerUrls[0]
}

const getTxScanUrl = (transactionHash: string, network: string) => {
  const baseURL = scanURL(network ?? MAINNET)
  return `${baseURL}tx/${transactionHash}`
}

const getAddressScanUrl = (userAddress: string, network: string) => {
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
    executorAddress: txExecution.executorAddress,
    // @todo validators tx are only created in the GNOSIS network
    scanUrl: getTxScanUrl(txExecution.transactionHash, GNOSIS),
  }
}

const transformValidation = (txValidation: TransactionValidationSG): TransactionValidation => {
  return {
    id: txValidation.id,
    timestamp: fromSubgraphTimestamp(txValidation.timestamp),
    transactionHash: txValidation.transactionHash,
    validatorAddress: txValidation.validatorAddress,
    // @todo validators tx are only created in the GNOSIS network
    scanUrl: getTxScanUrl(txValidation.transactionHash, GNOSIS),
  }
}

const transformTx = (tx: TransactionSG): Transaction => {
  return {
    id: tx.id,
    // @todo tx from subgraph should return their transactionHash
    transactionHash: tx.transactionHash ?? tx.id,
    bridgeName: tx.bridgeName ?? '',
    initiator: tx.initiator ?? '',
    // initiatorAmount: formatNumber(fromBNtoNumber(tx.initiatorAmount) ?? 0),
    initiatorAmount: '',
    initiatorNetwork: tx.initiatorNetwork ?? '',
    initiatorNetworkIcon: getNetworkIcon(tx.initiatorNetwork ?? ''),
    // initiatorToken: tx.initiatorToken,
    initiatorToken: '',
    receiver: tx.receiver,
    // receiverAmount: formatNumber(fromBNtoNumber(tx.receiverAmount) ?? 0),
    receiverAmount: '',
    // @todo complete this data in SG, DAI address
    initiatorTokenData: getTokenData(tx.initiatorNetwork ?? ''),
    receiverNetwork: tx.receiverNetwork ?? '',
    receiverNetworkIcon: getNetworkIcon(tx.receiverNetwork ?? ''),
    // receiverToken: tx.receiverToken,
    receiverToken: '',
    // @todo complete this data in SG, DAI address
    receiverTokenData: getTokenData(tx.receiverNetwork ?? ''),
    timestamp: fromSubgraphTimestamp(tx.timestamp),
    transactionStatus: tx.transactionStatus ?? TransactionStatus.Initiated,
    validations: tx.validations.map(transformValidation),
    execution: transformExecution(tx.execution ?? undefined),
    // @todo tx from subgraph should return their transactionHash
    scanUrl: getTxScanUrl(tx.transactionHash ?? tx.id, tx.initiatorNetwork ?? ''),
    initiatorScanUrl: getAddressScanUrl(tx.initiator, tx.initiatorNetwork ?? ''),
    receiverScanUrl: getAddressScanUrl(tx.receiver, tx.receiverNetwork ?? ''),
  }
}

export const unifyTransactions = (txs: TransactionSG[]) => {
  const transactions: Record<string, TransactionSG> = {}
  txs.forEach((tx) => {
    if (!transactions[tx.id]) {
      transactions[tx.id] = tx // id, bridgeName, ..
    } else {
      // @todo order of statuses initiated -> pending -> completed
      // if it was already completed do not update the status
      if (transactions[tx.id].transactionStatus !== TransactionStatus.Completed) {
        transactions[tx.id].transactionStatus = tx.transactionStatus
      }
    }

    // @todo each flow is similar (gnosis -> eth, eth -> gnosis), the only difference is
    // that we set execution when the property exists, otherwise we set validators
    if (!tx.execution) {
      transactions[tx.id].initiator = tx.initiator
      transactions[tx.id].initiatorNetwork = tx.initiatorNetwork
      // transactions[tx.id].initiatorAmount = tx.initiatorAmount
      // @todo quickfix to handle case of overwriting validations when not necessary
      if (tx.validations.length > 0) {
        transactions[tx.id].validations = tx.validations
      }
      transactions[tx.id].timestamp = tx.timestamp // @todo we use the timestamp of the beginning of the tx
    } else {
      transactions[tx.id].receiver = tx.receiver
      transactions[tx.id].receiverNetwork = tx.receiverNetwork
      // transactions[tx.id].receiverAmount = tx.receiverAmount
      transactions[tx.id].execution = tx.execution
    }
  })
  return Object.values(transactions)
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

const fetchUncompletedTransactions = async (transactions: TransactionSG[]) => {
  // search foreigns when tx is completed but has no execution
  const uncompletedForeigns = transactions.filter((tx) => {
    const isCompleted = tx.transactionStatus === TransactionStatus.Completed
    return isCompleted && !tx.execution
  })
  const foreignsIds = uncompletedForeigns.map((tx) => tx.id)
  let completedForeigns: TransactionSG[] = []
  if (foreignsIds.length > 0) {
    completedForeigns = (await fetchForeignTransaction({
      where: { id_in: foreignsIds },
    })) as TransactionSG[]
  }

  // search natives txs when tx is completed but has no validations
  const uncompletedNatives = transactions.filter((tx) => {
    const isCompleted = tx.transactionStatus === TransactionStatus.Completed
    return isCompleted && tx.validations.length === 0
  })
  const nativesIds = uncompletedNatives.map((tx) => tx.id)
  let completedNatives: TransactionSG[] = []
  if (nativesIds.length > 0) {
    completedNatives = (await fetchHomeTransaction({
      where: { id_in: nativesIds },
    })) as TransactionSG[]
  }

  // @todo hardcoding the Transaction type from SG because TypeScript can not infer
  const completedTxs = transactions.concat(completedNatives).concat(completedForeigns)
  return unifyTransactions(completedTxs)
}

// @todo we use existing tx data to fill the missing gaps (initiator or receiver)
const fixMissingData = (tx: Transaction): Transaction => {
  if (!!tx.initiatorNetwork && !!tx.receiverNetwork) {
    return tx
  }
  if (!tx.initiatorNetwork) {
    const network = tx.receiverNetwork === MAINNET ? GNOSIS : MAINNET
    return {
      ...tx,
      initiator: tx.receiver,
      initiatorNetwork: network,
      initiatorAmount: tx.receiverAmount,
      initiatorScanUrl: getAddressScanUrl(tx.receiver, network),
    }
  } else {
    const network = tx.initiatorNetwork === MAINNET ? GNOSIS : MAINNET
    return {
      ...tx,
      receiver: tx.initiator,
      receiverNetwork: network,
      receiverAmount: tx.initiatorAmount,
      initiatorScanUrl: getAddressScanUrl(tx.initiator, network),
    }
  }
}

export const fetchTransactions = async (query?: TransactionsQueryVariables) => {
  const [nativeTxs, foreignTxs] = await Promise.all([
    fetchHomeTransaction(query),
    fetchForeignTransaction(query),
  ])
  // @todo hardcoding the Transaction type from SG because TypeScript can not infer
  const allTxs = nativeTxs.concat(foreignTxs) as TransactionSG[]
  const transactions = unifyTransactions(allTxs)

  const txs = await fetchUncompletedTransactions(transactions)
  return txs.map(transformTx).map(fixMissingData)
}
