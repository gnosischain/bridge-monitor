import { useForeignGraphqlClient, useNativeGraphqlClient } from "@/src/constants/config/subgraph"
import { TRANSACTION_QUERY } from "@/src/queries/transactions"
import { TransactionsQuery, TransactionsQueryVariables, TransactionStatus } from "@/types/generated/subgraph"

/**
 * @todo we are hardcode generating many unnecessary types as those should be generated automatically by graphql codegen...
 */
type TransactionExecution = {
  __typename?: "TransactionExecution"
  id: string
  transactionHash?: string
  executorAddress?: string
  timestamp?: string
}

type TransactionValidation = {
  __typename?: "TransactionValidation"
  id: string
  transactionHash?: string
  validatorAddress?: string
  timestamp?: string
}

type Transaction = {
  __typename?: "Transaction"
  id: string
  bridgeName?: string
  initiator?: string
  initiatorNetwork?: string
  initiatorAmount?: string
  receiver?: string
  receiverNetwork?: string
  receiverAmount?: string
  transactionStatus?: TransactionStatus
  timestamp?: string
  execution?: TransactionExecution;
  validations: TransactionValidation[];
}

const fetchNativeTransaction = async (filter?: TransactionsQueryVariables) => {
  const { transactions } = await useNativeGraphqlClient()<
    TransactionsQuery,
    TransactionsQueryVariables
  >(TRANSACTION_QUERY, filter)
  return transactions
}

const fetchForeignTransaction = async (filter?: TransactionsQueryVariables) => {
  const { transactions } = await useForeignGraphqlClient()<
    TransactionsQuery,
    TransactionsQueryVariables
  >(TRANSACTION_QUERY, filter)
  return transactions
}

// gnosis -> ethereum @todo needs to think about the eth -> gnosis
const unifyTransactions = (txs: Transaction[]) => {
  let transactions: Record<string, Transaction> = {}
  // we can use reduce...
  txs.forEach((tx) => {
    // gnosis tx
    if (!transactions[tx.id]) {
      transactions[tx.id] = tx // id, bridgeName, ..
    }

    if (tx.initiatorNetwork === "xdai") {
      transactions[tx.id].initiator = tx.initiator
      transactions[tx.id].initiatorNetwork = tx.initiatorNetwork
      transactions[tx.id].initiatorAmount = tx.initiatorAmount
      transactions[tx.id].transactionStatus = tx.transactionStatus
      transactions[tx.id].timestamp = tx.timestamp
      transactions[tx.id].validations = tx.validations
    }
    // mainnet tx
    if (tx.receiverNetwork === "mainnet") {
      transactions[tx.id].receiver = tx.receiver
      transactions[tx.id].receiverNetwork = tx.receiverNetwork
      transactions[tx.id].receiverAmount = tx.receiverAmount
      transactions[tx.id].execution = tx.execution
    }
  })
  return Object.values(transactions)
}

const fetchUncompletedTransactions = async (transactions: Transaction[]) => {
  // search foreigns when tx is completed but has no execution
  const uncompletedForeigns = transactions.filter(tx => {
    const isCompleted = tx.transactionStatus === TransactionStatus.Completed
    return isCompleted && !tx.execution
  })
  const foreignsIds = uncompletedForeigns.map(tx => tx.id)
  const completedForeigns = await fetchForeignTransaction({ where: { id_in: foreignsIds }})

  // search natives txs when tx is completed but has no validations
  const uncompletedNatives = transactions.filter(tx => {
    const isCompleted = tx.transactionStatus === TransactionStatus.Completed
    return isCompleted && tx.validations.length === 0
  })
  const nativesIds = uncompletedNatives.map(tx => tx.id)
  const completedNatives = await fetchNativeTransaction({ where: { id_in: nativesIds }})

  // @todo hardcoding the Transaction type
  const _completedNatives = completedNatives.map(tx => tx as Transaction)
  const _completedForeigns = completedForeigns.map(tx => tx as Transaction)
  const completedTxs = transactions.concat(_completedNatives).concat(_completedForeigns)
  return unifyTransactions(completedTxs)
}

// @todo add swr support
const fetchTransactions = async () => {
  const [nativeTxs, foreignTxs] = await Promise.all([
    fetchNativeTransaction(),
    fetchForeignTransaction(),
  ])
  // @TODO here we are hardcoding the Transaction type
  const allTxs = nativeTxs.concat(foreignTxs).map(tx => tx as Transaction)
  const transactions = unifyTransactions(allTxs)

  console.log(`Transaction unified from SGs`)
  console.log(transactions.length)
  const txs = await fetchUncompletedTransactions(transactions)
  console.log(`Transaction unified with completed`)
  console.log(txs.length)
  console.log(txs)
  return txs
}

export { fetchTransactions }
