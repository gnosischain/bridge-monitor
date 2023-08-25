import { fromBNtoNumber } from './bigNumber'
import { fromSubgraphTimestamp } from './date'
import { formatNumber } from './formatNumber'
import { chainsConfig } from '../constants/config/chains'
import { Chains } from '../constants/config/types'
import { Token, tokens } from '../constants/token'
import { getForeignGraphqlClient, getHomeGraphqlClient } from '@/src/constants/config/subgraph'
import { TRANSACTION_QUERY } from '@/src/queries/transactions'
import {
  OrderDirection,
  TransactionExecution as TransactionExecutionSG,
  Transaction as TransactionSG,
  TransactionStatus,
  TransactionValidation as TransactionValidationSG,
  Transaction_OrderBy,
  TransactionsQuery,
  TransactionsQueryVariables,
} from '@/types/generated/subgraph'

const GNOSIS = 'gnosis'
const MAINNET = 'mainnet'

const MAX_RESULTS = 800
const RESULTS_ORDER = OrderDirection.Desc
const ORDER_BY = Transaction_OrderBy.Timestamp

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

const getTokenData = (tokenAddress: string) => {
  // @todo: refactor in order to render required OMNIBridge tokens
  // const token = tokens[tokenName as keyof typeof tokens]
  const token = Object.values(tokens).find(
    (token) => token.address.toLowerCase() === tokenAddress.toLowerCase(),
  )
  return token
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
  return {
    id: tx.id,
    // @todo tx from subgraph should return their transactionHash
    transactionHash: tx.transactionHash ?? tx.id,
    bridgeName: tx.bridgeName ?? '',
    initiator: tx.initiator ?? '',
    initiatorAmount: formatNumber(fromBNtoNumber(tx.initiatorAmount) ?? 0),
    initiatorNetwork: tx.initiatorNetwork ?? '',
    initiatorNetworkIcon: getNetworkIcon(tx.initiatorNetwork ?? ''),
    initiatorToken: '',
    receiver: tx.receiver,
    receiverAmount: formatNumber(fromBNtoNumber(tx.receiverAmount) ?? 0),
    // @todo complete this data in SG, DAI address
    initiatorTokenData: getTokenData(tx.initiatorToken ?? ''),
    receiverNetwork: tx.receiverNetwork ?? '',
    receiverNetworkIcon: getNetworkIcon(tx.receiverNetwork ?? ''),
    receiverToken: '',
    // @todo complete this data in SG, DAI address
    receiverTokenData: getTokenData(tx.receiverToken ?? ''),
    timestamp: fromSubgraphTimestamp(tx.timestamp),
    transactionStatus: tx.transactionStatus ?? TransactionStatus.Initiated,
    validations: tx.validations?.map(transformValidation),
    execution: transformExecution(tx.execution ?? undefined),
    // @todo tx from subgraph should return their transactionHash
    scanUrl: getTxScanUrl(tx.transactionHash ?? tx.id, tx.initiatorNetwork ?? ''),
    initiatorScanUrl: getAddressScanUrl(tx.initiator, tx.initiatorNetwork ?? ''),
    receiverScanUrl: getAddressScanUrl(tx.receiver, tx.receiverNetwork ?? ''),
  }
}

const isCompleted = (tx: TransactionSG): boolean => {
  return tx.transactionStatus === TransactionStatus.Completed
}

const isClaimed = (tx: TransactionSG): boolean => {
  return tx.transactionStatus === TransactionStatus.Claimed
}

const isUnclaimed = (tx: TransactionSG): boolean => {
  return tx.transactionStatus === TransactionStatus.Unclaimed
}

const isCollecting = (tx: TransactionSG): boolean => {
  return tx.transactionStatus === TransactionStatus.Collecting
}

const isRequested = (tx: TransactionSG): boolean => {
  return tx.transactionStatus === TransactionStatus.Requested
}

const isInitiated = (tx: TransactionSG): boolean => {
  return tx.transactionStatus === TransactionStatus.Initiated
}

export const unifyTransactions = (txs: TransactionSG[]) => {
  const transactions: Record<string, TransactionSG> = {}
  txs.forEach((tx) => {
    if (!transactions[tx.id]) {
      transactions[tx.id] = tx // id, bridgeName, ..
    } else {
      if (isCompleted(tx)) {
        // adds missing data when Tx is GC-ETH direction
        transactions[tx.id].receiver = tx.receiver
        transactions[tx.id].receiverAmount = tx.receiverAmount
        transactions[tx.id].receiverNetwork = tx.receiverNetwork
        if (tx.execution) {
          transactions[tx.id].execution = tx.execution
        }
        // updates Tx status (previos state: UNCLAIMED)
        transactions[tx.id].transactionStatus = tx.transactionStatus
      } else if (
        isClaimed(tx) &&
        transactions[tx.id].transactionStatus !== TransactionStatus.Completed
      ) {
        transactions[tx.id].transactionStatus = tx.transactionStatus
      } else if (
        isUnclaimed(tx) &&
        (transactions[tx.id].transactionStatus !== TransactionStatus.Claimed ||
          transactions[tx.id].transactionStatus !== TransactionStatus.Completed)
      ) {
        transactions[tx.id].initiator = tx.initiator
        transactions[tx.id].transactionStatus = tx.transactionStatus
      } else if (
        isCollecting(tx) &&
        transactions[tx.id].transactionStatus !== TransactionStatus.Unclaimed
      ) {
        transactions[tx.id].transactionStatus = tx.transactionStatus
      } else if (
        isRequested(tx) &&
        transactions[tx.id].transactionStatus !== TransactionStatus.Collecting
      ) {
        transactions[tx.id].transactionStatus = tx.transactionStatus
      } else if (isInitiated(tx)) {
        // adds initiator data when Tx is ETH-GC direction
        transactions[tx.id].initiator = tx.initiator
        transactions[tx.id].initiatorAmount = tx.initiatorAmount
        transactions[tx.id].initiatorNetwork = tx.initiatorNetwork
        transactions[tx.id].timestamp = tx.timestamp
        // fixes originTx hash shown when TX is ETH-GC
        transactions[tx.id].transactionHash = tx.transactionHash
      }
    }

    // @todo each flow is similar (gnosis -> eth, eth -> gnosis), the only difference is
    // that we set execution when the property exists, otherwise we set validators
    if (!tx.execution) {
      // @todo quickfix to handle case of overwriting validations when not necessary
      if (tx.validations && tx.validations.length > 0) {
        transactions[tx.id].validations = tx.validations
      }
    } else {
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

// OUTDATED: aimed to refetch transaction information when filtering Txs by status others than COMPLETED
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
    return isCompleted && tx.validations?.length === 0
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

export const fetchTransactions = async (query: TransactionsQueryVariables) => {
  // first fetch round applying all filters
  const [nativeTxs, foreignTxs] = await Promise.all([
    fetchHomeTransaction(query),
    fetchForeignTransaction(query),
  ])
  // @todo hardcoding the Transaction type from SG because TypeScript can not infer
  const allTxs = nativeTxs.concat(foreignTxs) as TransactionSG[]

  let transactions = unifyTransactions(allTxs)

  const addsFilterByStatus = (query: TransactionsQueryVariables): boolean => {
    return query?.where?.transactionStatus !== undefined
  }

  const confirmHomeTxs = async (nativeIds: string[]) => {
    // checks for TXs with update on foreignSG
    const homesWithUpdate = (await fetchForeignTransaction({
      first: MAX_RESULTS,
      orderBy: ORDER_BY,
      orderDirection: RESULTS_ORDER,
      where: { id_in: nativeIds },
    })) as TransactionSG[]
    const txsToBeRemovedIds = homesWithUpdate.map((tx) => tx.id)
    // removes TX ids with update
    const confirmedTxsIds = nativeIds.filter((id) => {
      return !txsToBeRemovedIds.includes(id)
    })
    // fetches TXs with no update on foreignSG
    const confirmedTxs = (await fetchHomeTransaction({
      first: MAX_RESULTS,
      orderBy: ORDER_BY,
      orderDirection: RESULTS_ORDER,
      where: { id_in: confirmedTxsIds },
    })) as TransactionSG[]
    return confirmedTxs
  }

  const confirmForeignTxs = async (foreignIds: string[]) => {
    // checks for TXs with update on homeSG
    const foreignsWithUpdate = (await fetchHomeTransaction({
      first: MAX_RESULTS,
      orderBy: ORDER_BY,
      orderDirection: RESULTS_ORDER,
      where: { id_in: foreignIds },
    })) as TransactionSG[]
    const txsToBeRemovedIds = foreignsWithUpdate.map((tx) => tx.id)
    const confirmedTxsIds = foreignIds.filter((id) => {
      return !txsToBeRemovedIds.includes(id)
    })
    // fetches TXs with no update on foreignSG
    const confirmedTxs = (await fetchHomeTransaction({
      first: MAX_RESULTS,
      orderBy: ORDER_BY,
      orderDirection: RESULTS_ORDER,
      where: { id_in: confirmedTxsIds },
    })) as TransactionSG[]
    return confirmedTxs
  }

  if (addsFilterByStatus(query)) {
    // when STATUS filter is set, fetched txs status must be confirmed
    const nativeIds = nativeTxs.map((tx) => tx.id)
    const foreignIds = foreignTxs.map((tx) => tx.id)
    const statusFilterValue = query?.where?.transactionStatus

    const isFilteredByStatus = (txStatus: string): boolean => {
      return statusFilterValue === txStatus
    }
    if (isFilteredByStatus(TransactionStatus.Initiated)) {
      // all nativeTxs with INITIATED status are confirmed txs
      // for foreignTxs, they will have an update over homeSG
      const confirmedTxs = await confirmForeignTxs(foreignIds)
      transactions = nativeTxs.concat(confirmedTxs) as TransactionSG[]
    } else if (isFilteredByStatus(TransactionStatus.Requested)) {
      // all nativeTxs with REQUESTED status are confirmed txs
      // for foreignTxs, they might have an update over homeSG
      const confirmedTxs = await confirmForeignTxs(foreignIds)
      transactions = nativeTxs.concat(confirmedTxs) as TransactionSG[]
    } else if (isFilteredByStatus(TransactionStatus.Claimed)) {
      // only check from nativeTxs if they transitioned over foreignSG
      // ETH-GC flow dont have a CLAIMED status, since RelayedMessage event its not triggered
      const confirmedTxs = await confirmHomeTxs(nativeIds)
      transactions = confirmedTxs as TransactionSG[]
    } else if (isFilteredByStatus(TransactionStatus.Unclaimed)) {
      // search for counterpart on the otherside (home and foreign)
      // ETH-GC flow dont have a UNCLAIMED status, since all validations happen on HomeSG
      const confirmedHomeTxs = await confirmHomeTxs(nativeIds)
      transactions = confirmedHomeTxs as TransactionSG[]
      // return only those with no update from otherside
    } else if (isFilteredByStatus(TransactionStatus.Completed)) {
      transactions = await fetchUncompletedTransactions(transactions)
    }
    // @todo: before returning transactions, sorted arrays must be merged by timestamp
  }
  return transactions.map(transformTx)
}
