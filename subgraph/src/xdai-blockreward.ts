import { Address, dataSource, log } from "@graphprotocol/graph-ts"
import { AddedReceiver } from "../generated/BlockReward/BlockReward"
import { XDAITransaction } from "../generated/schema"
import { parseTXInput } from "./message"

export function handlerAddedReceiver(event: AddedReceiver): void {
  // AddedReceiver (uint256 amount, index_topic_1 address receiver, index_topic_2 address bridge)
  const txInputContent = event.transaction.input.toHexString()
  const transactionHash = parseTXInput(txInputContent)
  const timestamp = event.block.timestamp
  const sender = event.transaction.from // validator !!
  const receiver = event.params.receiver
  const txValue = event.params.amount

  let transaction = XDAITransaction.load(transactionHash)
  if (!transaction) {
    log.error(`Transaction NOT FOUND ${transactionHash} @handlerAddedReceiver`, [])
    transaction = new XDAITransaction(transactionHash)
  }
  log.error(`Transaction FOUND ${transactionHash} @handlerAddedReceiver`, [])
  
  transaction.transactionHash = Address.fromHexString(transactionHash)
  transaction.bridgeName = 'XDAI'
  // transaction.initiator = sender
  transaction.initiatorAmount = txValue
  transaction.initiatorNetwork = 'mainnet'
  transaction.receiver = receiver
  transaction.receiverAmount = txValue
  transaction.receiverNetwork = dataSource.network()
  transaction.transactionStatus = "COMPLETED"
  transaction.timestamp = timestamp
  transaction.save()
}