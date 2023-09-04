import gql from 'graphql-tag'

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
      responsableAddress
    }
    validations {
      id
      timestamp
      transactionHash
      responsableAddress
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
