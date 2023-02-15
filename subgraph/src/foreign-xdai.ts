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
    const id = event.transaction.hash.toHexString()
    let transaction = new XDAITransaction(id)
    transaction.transactionHash = event.transaction.hash
    transaction.bridgeName = 'XDAI'
    transaction.transactionStatus = 'INITIATED'
    transaction.initiator = event.params.src
    transaction.initiatorAmount = event.params.wad
    transaction.initiatorNetwork = dataSource.network()
    transaction.timestamp = event.block.timestamp
    transaction.save()
  }
}

export function handlerUserRequestForAffirmation(
  event: UserRequestForAffirmation
): void {
  const id = event.transaction.hash.toHexString()
  let transaction = new XDAITransaction(id)
  transaction.bridgeName = 'XDAI'
  transaction.transactionStatus = 'REQUESTED'
  transaction.initiator = event.transaction.from // event.params.recipient
  transaction.initiatorAmount = event.params.value
  transaction.initiatorNetwork = dataSource.network()
  transaction.timestamp = event.block.timestamp
  transaction.save()
}

export function handlerRelayedMessage(
  event: RelayedMessage
): void {
  const id = event.params.transactionHash.toHexString()
  let transaction = new XDAITransaction(id)
  const executorId = event.transaction.from // executor address
  const executionId = transaction.id + '-' + executorId.toHexString()
  let execution = new TransactionExecution(executionId)

  let validator = Validator.load(executorId.toHexString())
  if (!validator) {
    log.error(`Validator ${executorId.toHexString()} not found @handlerRelayedMessage-foreignXDAI`, [])
  } else {
    execution.executor = validator.id
    validator.lastActivity = event.block.timestamp
    validator.save()
  }
  execution.executorAddress = executorId
  execution.transaction = transaction.id
  execution.transactionHash = event.transaction.hash
  execution.timestamp = event.block.timestamp
  execution.save()

  transaction.transactionHash = event.params.transactionHash
  transaction.bridgeName = 'XDAI'
  transaction.transactionStatus = 'COMPLETED'
  transaction.receiver = event.params.recipient
  transaction.receiverNetwork = dataSource.network()
  transaction.receiverAmount = event.params.value
  transaction.timestamp = event.block.timestamp
  transaction.execution = execution.id
  transaction.save()
}