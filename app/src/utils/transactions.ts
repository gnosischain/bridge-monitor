import { getForeignTransactions } from '@/src/utils/localTransactions'
import { fromSubgraphTimestamp } from '@/src/utils/date'
import { chainsConfig } from '@/src/constants/config/chains'
import { Chains } from '@/src/constants/config/types'
import { Token } from '@/types/token'
import { getForeignGraphqlClient, getHomeGraphqlClient } from '@/src/constants/config/subgraph'
import { TRANSACTION_QUERY } from '@/src/queries/transactions'
import {
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

const fetchHomeTransaction = async (query?: QueryTransactionsArgs) => {
  let skip = 0
  let transactions: TransactionsQuery['transactions'] = []
  let shouldIterate = true

  while (shouldIterate) {
    const { transactions: newTransactions } = await getHomeGraphqlClient()<
      TransactionsQuery,
      QueryTransactionsArgs
    >(TRANSACTION_QUERY, { ...query, skip, first: defaultRequestLimit })

    transactions = [...transactions, ...newTransactions]
    skip += query?.first ?? defaultRequestLimit
    shouldIterate = newTransactions.length == (query?.first ?? defaultRequestLimit)
  }

  return transactions
}

const fetchForeignTransaction = async (query?: QueryTransactionsArgs) => {
  let skip = 0
  let transactions: TransactionsQuery['transactions'] = []
  let shouldIterate = true

  while (shouldIterate) {
    const { transactions: newTransactions } = await getForeignGraphqlClient()<
      TransactionsQuery,
      QueryTransactionsArgs
    >(TRANSACTION_QUERY, { ...query, skip, first: defaultRequestLimit })

    transactions = [...transactions, ...newTransactions]
    skip += query?.first ?? defaultRequestLimit
    shouldIterate = newTransactions.length == (query?.first ?? defaultRequestLimit)
  }

  return transactions
}

export const unifyTransactions = async (
  _homeTxs: TransactionSG[],
  _foreignTxs: TransactionSG[],
) => {
  let homeTxs = [..._homeTxs]
  let foreignTxs = [..._foreignTxs]

  // Some filters like tx.hash or tx.timestamp will filter txs only on one side.
  // We use the tx id from one side to bring the tx from the other side.
  const foreignTxsIds = foreignTxs.map((tx) => tx.id)
  const homeTxsIds = homeTxs.map((tx) => tx.id)

  // all the txs that are on home but not on foreign
  const missingForeignIds = homeTxsIds.filter((id) => !foreignTxsIds.includes(id))
  // all the txs that are on foreign but not on home
  const missingHomeIds = foreignTxsIds.filter((id) => !homeTxsIds.includes(id))

  // if there are missing txs on home, we fetch them and assign them to homeTxs
  if (missingHomeIds.length > 0) {
    const missingTxs = (await fetchHomeTransaction({
      where: { id_in: missingHomeIds },
    })) as TransactionSG[]

    homeTxs = [...homeTxs, ...missingTxs]
  }

  // if there are missing txs on foreign, we fetch them and assign them to foreignTxs
  if (missingForeignIds.length > 0) {
    const missingTxs = (await fetchForeignTransaction({
      where: { id_in: missingForeignIds },
    })) as TransactionSG[]

    const localForeignTxs = getForeignTransactions()
    const persistedTxs = localForeignTxs
      ? missingForeignIds
          .map((missingForeignId) => localForeignTxs[missingForeignId])
          .filter((tx) => tx)
      : []

    foreignTxs = [...foreignTxs, ...persistedTxs, ...missingTxs]
  }

  // 1. initiate with homeTxs.
  const allTransactions: Record<string, TransactionSG> = homeTxs.reduce((acc, tx) => {
    acc[tx.id] = tx
    return acc
  }, {} as Record<string, TransactionSG>)

  // 2. hydrate with foreign txs
  foreignTxs.forEach((foreignTx) => {
    if (!allTransactions[foreignTx.id]) {
      // initiated on foreign but home is not aware of it yet
      allTransactions[foreignTx.id] = foreignTx
    } else {
      const hydratedTx = allTransactions[foreignTx.id]

      if (foreignTx.initiatorNetwork == 'gnosis') {
        // get execution info from foreign
        if (foreignTx.execution) {
          hydratedTx.transactionStatus = foreignTx.transactionStatus
          hydratedTx.execution = foreignTx.execution
        }
      } else {
        // get initiator info from foreign
        hydratedTx.transactionHash = foreignTx.transactionHash
        hydratedTx.timestamp = foreignTx.timestamp
        hydratedTx.initiator = foreignTx.initiator
        hydratedTx.initiatorAmount = foreignTx.initiatorAmount
        hydratedTx.initiatorNetwork = foreignTx.initiatorNetwork
        hydratedTx.initiatorToken = foreignTx.initiatorToken
      }
    }
  })

  return Object.values(allTransactions).sort((a, b) => Number(b.timestamp) - Number(a.timestamp))
}

export const fetchTransactions = async (
  query: QueryTransactionsArgs,
  inMemoryFilters: TxsInMemoryFilters,
) => {
  const [homeTxs, foreignTxs] = await Promise.all([
    fetchHomeTransaction(query),
    fetchForeignTransaction(query),
  ])

  let transactions = await unifyTransactions(
    homeTxs as TransactionSG[],
    foreignTxs as TransactionSG[],
  )

  if (inMemoryFilters.validator) {
    transactions = transactions
      .filter((tx) => tx.validations)
      .filter((tx) =>
        tx.validations?.some((validation) =>
          isSameString(validation.validatorAddr, inMemoryFilters.validator ?? ''),
        ),
      )
  }

  if (inMemoryFilters.executor) {
    transactions = transactions
      .filter((tx) => !!tx.execution?.validatorAddr)
      .filter((tx) => isSameString(tx.execution?.validatorAddr, inMemoryFilters.executor ?? ''))
  }

  const res = transactions.map(prepareTransactionForView)
  return res
}
