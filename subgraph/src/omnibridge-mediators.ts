import { dataSource } from "@graphprotocol/graph-ts"
import { TokensBridgingInitiated, TokensBridged } from "../generated/OmniBridgeMediator/OmniBridgeMediators"
import { OmniTransaction } from "../generated/schema"

export function handlerTokensBridgingInitiated(event: TokensBridgingInitiated): void {
  const transactionHash = event.transaction.hash
  const timestamp = event.block.timestamp
  const messageIdString = event.params.messageId.toHexString()
  const sender = event.params.sender
  const token = event.params.token
  const txValue = event.params.value

  let transaction = new OmniTransaction(messageIdString)
  transaction.transactionHash = transactionHash
  transaction.bridgeName = 'OmniBridge'
  transaction.initiator = sender
  transaction.initiatorToken = token
  transaction.initiatorAmount = txValue
  transaction.initiatorNetwork = dataSource.network()
  transaction.transactionStatus = "INITIATED"
  transaction.timestamp = timestamp
  transaction.save()
}

export function handlerTokensBridged(event: TokensBridged): void {
  const transactionHash = event.transaction.hash
  const timestamp = event.block.timestamp
  const messageIdString = event.params.messageId.toHexString()
  const receiver = event.params.recipient
  const token = event.params.token
  const txValue = event.params.value

  let transaction = new OmniTransaction(messageIdString)
  transaction.transactionHash = transactionHash
  transaction.bridgeName = 'OmniBridge'
  transaction.receiver = receiver
  transaction.receiverToken = token
  transaction.receiverAmount = txValue
  transaction.receiverNetwork = dataSource.network()
  transaction.transactionStatus = "COMPLETED"
  transaction.timestamp = timestamp
  transaction.save()
}
