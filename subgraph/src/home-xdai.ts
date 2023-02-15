import { BigInt, Bytes, dataSource, log } from "@graphprotocol/graph-ts"
import { AffirmationCompleted, CollectedSignatures, HomeBridgeErcToNative, SignedForAffirmation, SignedForUserRequest, UserRequestForSignature } from "../generated/HomeBridgeErcToNative/HomeBridgeErcToNative"
import { TransactionExecution, TransactionValidation, Validator, XDAITransaction } from "../generated/schema"
import { parseMessage } from "./message"

export function handlerUserRequestForSignature(
  event: UserRequestForSignature
): void {
  const id = event.transaction.hash.toHex()
  let transaction = new XDAITransaction(id)
  transaction.transactionHash = event.transaction.hash
  transaction.bridgeName = 'XDAI'
  transaction.initiator = event.transaction.from
  transaction.initiatorAmount = event.params.value
  transaction.initiatorNetwork = dataSource.network()
  transaction.transactionStatus = 'REQUESTED'
  transaction.timestamp = event.block.timestamp
  transaction.save()
}

export function handlerSignedForUserRequest(
  event: SignedForUserRequest
): void {
  const contract = HomeBridgeErcToNative.bind(event.address)
  const messageHash = event.params.messageHash
  const message = contract.message(messageHash)
  const parsed = parseMessage(message.toHexString())
  const transactionId = parsed[2]
  let transaction = new XDAITransaction(transactionId)

  const signer = event.params.signer // validator address
  let validator = Validator.load(signer.toHexString())
  if (!validator) {
    log.error(`Validator ${signer.toHexString()} not found @handlerSignedForUserRequest-homeXDAI`, [])
  } else {
    const txValidationId = transaction.id + '-' + validator.id
    let txValidation = new TransactionValidation(txValidationId)
    txValidation.validator = validator.id
    txValidation.validatorAddress = signer
    txValidation.transactionHash = event.transaction.hash
    txValidation.transaction = transaction.id
    txValidation.timestamp = event.block.timestamp
    txValidation.save()

    validator.lastActivity = event.block.timestamp
    validator.save()
  }
  transaction.transactionStatus = 'COLLECTING'
  transaction.save()
}

export function handlerSignedForAffirmation(event: SignedForAffirmation): void {
  const transactionId = event.params.transactionHash
  const validatorId = event.params.signer // validator address
  let transaction = new XDAITransaction(transactionId.toHexString())

  let validator = Validator.load(validatorId.toHexString())
  if (!validator) {
    log.error(`Validator ${validatorId.toHexString()} not found @handlerSignedForAffirmation-homeXDAI`, [])
  } else {
    const txValidationId = transaction.id + '-' + validator.id
    let txValidation = new TransactionValidation(txValidationId)
    txValidation.validator = validator.id
    txValidation.validatorAddress = validatorId
    txValidation.transactionHash = event.transaction.hash
    txValidation.transaction = transaction.id
    txValidation.timestamp = event.block.timestamp
    txValidation.save()

    validator.lastActivity = event.block.timestamp
    validator.save()
  }
  transaction.transactionStatus = 'COLLECTING'
  transaction.save()
}

export function handlerCollectedSignatures(
  event: CollectedSignatures
): void {
  const contract = HomeBridgeErcToNative.bind(event.address)
  const messageHash = event.params.messageHash
  const message = contract.message(messageHash)
  const parsed = parseMessage(message.toHexString())
  const recipient = parsed[0]
  const amount = parsed[1]
  const transactionId = parsed[2]

  const executorId = event.params.authorityResponsibleForRelay // validator address
  const executionId = transactionId + '-' + executorId.toHexString()
  let execution = new TransactionExecution(executionId)
  let validator = Validator.load(executorId.toHexString())
  if (!validator) {
    log.error(`Validator ${executorId} not found @handlerCollectedSignatures-homeXDAI`, [])
  } else {
    execution.executor = validator.id
    validator.lastActivity = event.block.timestamp
    validator.save()
  }
  execution.executorAddress = executorId
  execution.transaction = transactionId
  execution.transactionHash = event.transaction.hash
  execution.timestamp = event.block.timestamp
  execution.save()

  let transaction = new XDAITransaction(transactionId)
  transaction.bridgeName = 'XDAI'
  transaction.transactionStatus = 'UNCLAIMED'
  transaction.receiver = Bytes.fromHexString(recipient)
  transaction.receiverNetwork = dataSource.network()
  transaction.timestamp = event.block.timestamp
  transaction.execution = execution.id
  transaction.save()
}

export function handlerAffirmationCompleted(event: AffirmationCompleted): void {
  const id = event.params.transactionHash
  let transaction = new XDAITransaction(id.toHexString())

  const executorId = event.transaction.from // executor address
  const executionId = transaction.id + '-' + executorId.toHexString()
  let execution = new TransactionExecution(executionId)
  let validator = Validator.load(executorId.toHexString())
  if (!validator) {
    log.error(`Validator ${executorId.toHexString()} not found @handlerAffirmationCompleted-homeXDAI`, [])
  } else {
    execution.executor = executorId.toHexString()
    validator.lastActivity = event.block.timestamp
    validator.save()
  }
  execution.executorAddress = executorId
  execution.transaction = transaction.id
  execution.transactionHash = event.transaction.hash
  execution.timestamp = event.block.timestamp
  execution.save()

  transaction.bridgeName = 'XDAI'
  transaction.transactionStatus = 'UNCLAIMED'
  transaction.receiver = event.params.recipient
  transaction.receiverNetwork = dataSource.network()
  transaction.receiverAmount = event.params.value
  transaction.timestamp = event.block.timestamp
  transaction.execution = execution.id
  transaction.save()
}
