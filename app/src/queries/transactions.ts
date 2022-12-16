import gql from 'graphql-tag'

const TRANSACTION_FRAGMENT = gql`
  fragment TransactionFragment on Transaction {
    id
    bridgeName
    transactionHash
    initiator
    initiatorNetwork
    receiver
    receiverNetwork
    transactionStatus
    timestamp
    execution {
      id
      timestamp
      transactionHash
      executorAddress
    }
    validations {
      id
      timestamp
      transactionHash
      validatorAddress
    }
  }
`

export const TRANSACTION_QUERY = gql`
  ${TRANSACTION_FRAGMENT}
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
`
