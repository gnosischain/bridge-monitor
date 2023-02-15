import { transaction } from '@/src/constants/transaction'
import { fromBNtoNumber } from '@/src/utils/bigNumber'

/* 
    @todo: Get info from SG
*/

export type Transaction = {
  bridgeName: string
  confirmedTimestamp: string
  executorAddress: string
  executorId: string
  executorTransaction: { timestamp: string; transactionHash: string }[]
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
  validations: {
    id: string
    validatorAddress: string
    transaction: {
      timestamp: string
      transactionHash: string
    }[]
  }[]
}

const getNetworkIcon = (network: string) => {
  return network === 'xdai' ? '/images/icons/eth.png' : '/images/icons/gnosis.png'
}
const getNetworkName = (network: string) => {
  return network === 'xdai' ? 'Gnosis' : 'Mainnet'
}
const getTokenIcon = (network: string) => {
  return network === 'xdai' ? '/images/icons/xdai.png' : '/images/icons/dai.png'
}

export const dataTx: Transaction = {
  bridgeName: transaction.bridgeName,
  confirmedTimestamp: transaction.confirmedTimestamp,
  executorAddress: transaction.execution.executorAddress,
  executorId: transaction.execution.id,
  executorTransaction: transaction.execution.transaction,
  initiator: transaction.initiator,
  receiver: transaction.receiver,
  initiatorAmount: fromBNtoNumber(transaction.initiatorAmount) ?? 0,
  initiatorNetwork: transaction.initiatorNetwork,
  receiverAmount: fromBNtoNumber(transaction.receiverAmount) ?? 0,
  receiverNetwork: transaction.receiverNetwork,
  initiatorNetworkIcon: getNetworkIcon(transaction.initiatorNetwork ?? ''),
  receiverNetworkIcon: getNetworkIcon(transaction.receiverNetwork ?? ''),
  initiatorTokenIcon: getTokenIcon(transaction.initiatorNetwork ?? ''),
  receiverTokenIcon: getTokenIcon(transaction.receiverNetwork ?? ''),
  initiatorName: getNetworkName(transaction.initiatorNetwork ?? ''),
  receiverName: getNetworkName(transaction.receiverNetwork ?? ''),
  timestampExecution: transaction.execution.transaction[0].timestamp,
  timestampStarted: transaction.timestamp,
  validations: transaction.validations,
  signaturesCheckedTimestamp: transaction.signaturesCheckedTimestamp,
  messageId: transaction.messageId,
}
