import { Bytes, dataSource } from "@graphprotocol/graph-ts";
import { RelayedMessage, UserRequestForAffirmation } from "../generated/ForeignAMB/ForeignAMB";
import { AMBTransaction, TransactionExecution, Validator } from "../generated/schema";
import { parseAMBMessage } from "./message";


export function handlerUserRequestForAffirmation(event: UserRequestForAffirmation): void {
  const transactionHash = event.transaction.hash
  const timestamp = event.block.timestamp
  const messageId = event.params.messageId
  const message = event.params.encodedData
  const messageIdString = messageId.toHexString()
  const network = dataSource.network()

  const parsed = parseAMBMessage(message.toHexString())
  const sender = parsed[1]

  let transaction = new AMBTransaction(messageIdString)
  transaction.bridgeName = 'AMB'
  transaction.messageId = messageId
  transaction.initiator = Bytes.fromHexString(sender)
  transaction.initiatorNetwork = network
  transaction.transactionHash = transactionHash
  transaction.transactionStatus = "INITIATED"
  transaction.timestamp = timestamp

  transaction.save()
}

export function handlerRelayedMessage(event: RelayedMessage): void {
  const transactionHash = event.transaction.hash
  const timestamp = event.block.timestamp
  const messageId = event.params.messageId
  const messageIdString = messageId.toHexString()
  const sender = event.params.sender
  const senderString = sender.toHexString()
  const status = event.params.status
  const network = dataSource.network()

  let transaction = new AMBTransaction(messageIdString)
  const transactionExecutionId = messageIdString + '-' + senderString
  let execution = new TransactionExecution(transactionExecutionId)
  let validator = Validator.load(senderString)
  if (validator) {
    execution.executor = validator.id
    validator.lastActivity = event.block.timestamp
    validator.save()
  }
  execution.executorAddress = sender
  execution.transaction = transaction.id
  execution.transactionHash = transactionHash
  execution.timestamp = timestamp
  execution.save()

  transaction.bridgeName = 'AMB'
  transaction.messageId = messageId
  transaction.receiver = sender
  transaction.receiverNetwork = network
  transaction.timestamp = timestamp
  transaction.execution = execution.id

  if (status) {
    transaction.transactionStatus = 'COMPLETED'
  } else {
    transaction.transactionStatus = 'ERROR'
  }
  transaction.save()
}
