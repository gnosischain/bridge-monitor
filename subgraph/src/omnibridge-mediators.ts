import { dataSource, log } from "@graphprotocol/graph-ts"
import { TokensBridgingInitiated, TokensBridged } from "../generated/OmniBridgeMediator/OmniBridgeMediators"
import { AMBTransaction } from "../generated/schema"

export function handlerTokensBridgingInitiated(event: TokensBridgingInitiated): void {
  const transactionHash = event.transaction.hash
  const timestamp = event.block.timestamp
  const messageId = event.params.messageId
  const sender = event.params.sender
  const token = event.params.token
  const txValue = event.params.value

  let transaction = new AMBTransaction(messageId.toHexString())
  transaction.messageId = messageId
  transaction.transactionHash = transactionHash
  transaction.bridgeName = 'AMB'
  transaction.initiator = sender
  transaction.initiatorToken = token
  transaction.initiatorAmount = txValue
  transaction.initiatorNetwork = dataSource.network()
  transaction.receiverAmount = txValue
  transaction.receiverNetwork = dataSource.network() == 'mainnet' ? 'gnosis' : 'mainnet'
  transaction.transactionStatus = "INITIATED"
  transaction.timestamp = timestamp
  transaction.save()
}

export function handlerTokensBridged(event: TokensBridged): void {
  const transactionHash = event.transaction.hash
  const timestamp = event.block.timestamp
  const messageId = event.params.messageId
  const receiver = event.params.recipient
  const token = event.params.token
  const txValue = event.params.value

  let transaction = new AMBTransaction(messageId.toHexString())
  transaction.messageId = messageId
  transaction.transactionHash = transactionHash
  transaction.bridgeName = 'AMB'
  transaction.initiatorAmount = txValue
  transaction.initiatorNetwork = dataSource.network() == 'mainnet' ? 'gnosis' : 'mainnet'
  transaction.receiver = receiver
  transaction.receiverToken = token
  transaction.receiverAmount = txValue
  transaction.receiverNetwork = dataSource.network()
  transaction.transactionStatus = "COMPLETED"
  transaction.timestamp = timestamp
  transaction.save()
}
