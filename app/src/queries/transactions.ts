import { RequestDocument } from 'graphql-request'

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
