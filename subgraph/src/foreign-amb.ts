import { Address, dataSource, log } from "@graphprotocol/graph-ts";
import { RelayedMessage, UserRequestForAffirmation } from "../generated/ForeignAMB/ForeignAMB";
import { AMBTransaction, TransactionExecution, Validator } from "../generated/schema";
import { isOmniBridgeUsage, isFromOmniBridgeUsage, parseAMBEncodedData } from "./message";

export function handlerUserRequestForAffirmation(event: UserRequestForAffirmation): void {
  // UserRequestForSignature (index_topic_1 bytes32 messageId, bytes encodedData)
  const transactionHash = event.transaction.hash
  const timestamp = event.block.timestamp
  const messageId = event.params.messageId
  const message = event.params.encodedData.toHexString()
  const network = dataSource.network()

  // filter transactions by home and foreign mediator addresses within encodedData param
  if (isOmniBridgeUsage(message)) {
    const messageContent = parseAMBEncodedData(message)
    let transaction = new AMBTransaction(messageId.toHexString())
    transaction.bridgeName = 'AMB'
    transaction.messageId = messageId
    transaction.initiatorNetwork = network
    transaction.receiver = Address.fromHexString(messageContent[2])
    transaction.receiverToken = Address.fromHexString(messageContent[1])
    transaction.receiverNetwork = 'gnosis'
    transaction.transactionStatus = "REQUESTED"
    transaction.timestamp = timestamp
    transaction.save()
  }
}

export function handlerRelayedMessage(event: RelayedMessage): void {
  const transactionHash = event.transaction.hash
  const timestamp = event.block.timestamp
  const messageId = event.params.messageId
  const messageIdString = messageId.toHexString()
  const sender = event.params.sender // home mediator address
  const executor = event.params.executor // foreign mediator address
  const senderString = sender.toHexString()
  const status = event.params.status
  const network = dataSource.network()

  if (isFromOmniBridgeUsage(senderString, executor.toHexString())) {
    let transaction = new AMBTransaction(messageIdString)
    const transactionExecutionId = messageIdString + '-' + senderString // sender is homeMediator !!
    let execution = new TransactionExecution(transactionExecutionId)
    let validator = Validator.load(senderString)
    if (!validator) {
      log.error(`Validator ${senderString} not found @handlerRelayedMessage-foreignAMB`, [])
    } else {
      execution.executor = validator.id
      validator.lastActivity = event.block.timestamp
      validator.save()
    }
    execution.responsableAddress = sender
    execution.transaction = transaction.id
    execution.transactionHash = transactionHash
    execution.timestamp = timestamp
    execution.save()

    transaction.bridgeName = 'AMB'
    transaction.messageId = messageId
    transaction.execution = execution.id
    transaction.timestamp = timestamp

    if (status) {
      transaction.transactionStatus = 'CLAIMED'
    } else {
      transaction.transactionStatus = 'ERROR'
    }
    transaction.save()
  }
}
