import { dataSource, log } from "@graphprotocol/graph-ts"
import { RelayedMessage, UserRequestForAffirmation } from "../generated/ForeignBridgeErcToNative/ForeignBridgeErcToNative"
import { XDAITransaction, TransactionExecution, Validator } from "../generated/schema"
import { Transfer } from "../generated/DAI/DAI"
import { FOREIGN_BRIDGE_ERC_TO_NATIVE_ADDRESS } from "./config/addresses"

// @todo filter txs where event.params.dst === foreign.address
export function handlerTransfer(
  event: Transfer
): void {
  if (FOREIGN_BRIDGE_ERC_TO_NATIVE_ADDRESS.toLowerCase() == event.params.dst.toHexString()) {
    const txHash = event.transaction.hash
    const txValue = event.params.wad
    const sender = event.params.src
    const timestamp = event.block.timestamp
    const originNetwork =  dataSource.network()
    log.error(`handlerTransfer XDAI ETH-GC INITIATED ${txHash.toHexString()} `,[])

    let transaction = new XDAITransaction(txHash.toHexString())
    transaction.transactionHash = txHash
    transaction.bridgeName = 'XDAI'
    transaction.transactionStatus = 'INITIATED'
    transaction.initiator = sender
    transaction.initiatorAmount = txValue
    transaction.initiatorNetwork = originNetwork
    transaction.receiverAmount = txValue
    transaction.receiverNetwork = 'gnosis'
    transaction.timestamp = timestamp
    transaction.save()
  }
}

export function handlerUserRequestForAffirmation(
  event: UserRequestForAffirmation
): void {
  const txHash = event.transaction.hash
  const txValue = event.params.value
  const sender = event.transaction.from
  const timestamp = event.block.timestamp
  const originNetwork =  dataSource.network()
  log.error(`handlerUserRequestForAffirmation XDAI ETH-GC REQUESTED
  event.transaction.hash ${txHash.toHexString()}`, [])

  let transaction = new XDAITransaction(txHash.toHexString())
  transaction.transactionHash = txHash
  transaction.bridgeName = 'XDAI'
  transaction.transactionStatus = 'REQUESTED'
  transaction.initiator = sender
  transaction.initiatorAmount = txValue
  transaction.initiatorNetwork = originNetwork
  transaction.receiverAmount = txValue
  transaction.receiverNetwork = 'gnosis'
  transaction.timestamp = timestamp
  transaction.save()
}

export function handlerRelayedMessage(
  event: RelayedMessage
): void {
  const txHash = event.params.transactionHash.toHexString()
  const timestamp = event.block.timestamp
  // const sender = event.transaction.from
  const txValue = event.params.value
  const originNetwork =  dataSource.network()
  log.error(`handlerRelayedMessage XDAI GC-ETH
  event.params.transactionHash ${txHash}
  event.transaction.hash ${event.transaction.hash.toHexString()}`, [])

  let transaction = new XDAITransaction(txHash)
  const executorId = event.transaction.from
  const executionId = txHash + '-' + executorId.toHexString()
  let execution = new TransactionExecution(executionId)

  let validator = Validator.load(executorId.toHexString())
  if (!validator) {
    log.error(`Validator ${executorId.toHexString()} not found @handlerRelayedMessage-foreignXDAI`, [])
  } else {
    execution.executor = executorId.toHexString()
    execution.executor = validator.id
    validator.lastActivity = timestamp
    validator.save()
  }
  execution.responsableAddress = executorId
  execution.transaction = txHash
  execution.transactionHash = event.transaction.hash
  execution.timestamp = timestamp
  execution.save()

  transaction.transactionHash = event.params.transactionHash
  transaction.bridgeName = 'XDAI'
  transaction.transactionStatus = 'COMPLETED'
  transaction.receiver = event.params.recipient
  transaction.receiverNetwork = dataSource.network()
  transaction.receiverAmount = txValue
  transaction.timestamp = timestamp
  transaction.execution = execution.id
  transaction.save()
}