import { TransactionExecution, TransactionValidation } from './transactions'

export type Transaction = {
  bridgeName: string
  confirmedTimestamp: string
  execution: TransactionExecution
  initiator: string
  receiver: string
  initiatorAmount: number
  receiverAmount: number
  receiverNetwork: string
  initiatorNetwork: string
  initiatorNetworkIcon: string
  receiverNetworkIcon: string
  initiatorTokenIcon: string
  receiverTokenIcon: string
  initiatorName: string
  receiverName: string
  timestampExecution: string
  timestampStarted: string
  signaturesCheckedTimestamp: string
  messageId: string
  validations: TransactionValidation[]
}
