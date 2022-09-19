import gql from 'graphql-tag'

export const TRANSACTION_QUERY = gql`
  query Transactions(
    $where: Transaction_filter
    $orderBy: Transaction_orderBy
    $orderDirection: OrderDirection)
  {
    transactions(
      where: $where,
      orderBy: $orderBy,
      orderDirection: $orderDirection
    ) {
      id
      bridgeName
      initiator
      initiatorNetwork
      initiatorAmount
      receiver
      receiverNetwork
      receiverAmount
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
  }
`
