import gql from 'graphql-tag'
import { RequestDocument } from 'graphql-request'

const TRANSACTION_FRAGMENT = gql`
  fragment TransactionFragment on Transaction {
    id
    bridgeName
    transactionHash
    initiator
    initiatorAmount
    initiatorNetwork
    initiatorToken
    receiver
    receiverToken
    receiverAmount
    receiverNetwork
    transactionStatus
    timestamp
    execution {
      id
      timestamp
      transactionHash
      validatorAddr
    }
    validations {
      id
      timestamp
      transactionHash
      validatorAddr
    }
  }
`

export const TRANSACTION_QUERY = gql`
  query Transactions(
    $where: Transaction_filter
    $orderBy: Transaction_orderBy
    $orderDirection: OrderDirection
    $first: Int
    $skip: Int
  ) {
    transactions(
      where: $where
      orderBy: $orderBy
      orderDirection: $orderDirection
      first: $first
      skip: $skip
    ) {
      ...TransactionFragment
    }
  }

  ${TRANSACTION_FRAGMENT}
`

export const ENVIO_TRANSACTIONS_QUERY = `
  query EnvioTransactions($where: Transaction_bool_exp, $order_by: [Transaction_order_by!], $limit: Int, $offset: Int) {
    Transaction(where: $where, order_by: $order_by, limit: $limit, offset: $offset) {
      id
      messageId
      bridgeType
      transactionHash
      timestamp
      initiatorNetwork
      initiator
      initiatorToken
      initiatorAmount
      receiverNetwork
      receiver
      receiverToken
      receiverAmount
      transactionStatus
      execution {
        id
        transactionHash
        timestamp
        executorAddress
      }
      validations {
        id
        transactionHash
        timestamp
        validatorAddress
      }
    }
  }
` as RequestDocument
