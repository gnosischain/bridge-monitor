import { dataSource } from "@graphprotocol/graph-ts"
import { AffirmationCompleted, CollectedSignatures, HomeBridgeErcToNative, SignedForAffirmation, SignedForUserRequest, UserRequestForSignature } from "../generated/HomeBridgeErcToNative/HomeBridgeErcToNative"
import { TransactionExecution, TransactionValidation, Validator, XDAITransaction } from "../generated/schema"
import { parseMessage } from "./message"

export function handleUserRequestForSignature(
  event: UserRequestForSignature
): void {
  const id = event.transaction.hash.toHex()
  let transaction = new XDAITransaction(id)
  transaction.transactionHash = event.transaction.hash
  transaction.bridgeName = 'XDAI'
  transaction.initiator = event.transaction.from
  transaction.initiatorAmount = event.params.value
  transaction.initiatorNetwork = dataSource.network()
  transaction.transactionStatus = 'INITIATED'
  transaction.timestamp = event.block.timestamp
  transaction.save()
}

export function handleSignedForUserRequest(
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
  if (validator) {
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
  transaction.transactionStatus = 'PENDING'
  transaction.save()
}

export function handleCollectedSignatures(
  event: CollectedSignatures
): void {
  const contract = HomeBridgeErcToNative.bind(event.address)
  const messageHash = event.params.messageHash
  const message = contract.message(messageHash)
  const parsed = parseMessage(message.toHexString())

  const transactionId = parsed[2]
  let transaction = new XDAITransaction(transactionId)
  const validatorId = event.params.authorityResponsibleForRelay.toHexString() // validator address
  let validator = new Validator(validatorId)

  transaction.transactionStatus = 'COMPLETED'
  transaction.save()
  validator.lastActivity = event.block.timestamp
  validator.save()
}

export function handlerSignedForAffirmation(event: SignedForAffirmation): void {
  const transactionId = event.params.transactionHash
  let transaction = new XDAITransaction(transactionId.toHexString())
  const validatorId = event.params.signer // validator address
  let validator = new Validator(validatorId.toHexString())

  const txValidationId = transaction.id + '-' + validator.id
  let txValidation = new TransactionValidation(txValidationId)

  txValidation.validator = validator.id
  txValidation.validatorAddress = validatorId
  txValidation.transactionHash = event.transaction.hash
  txValidation.transaction = transaction.id
  txValidation.timestamp = event.block.timestamp
  txValidation.save()
  transaction.transactionStatus = 'PENDING'
  transaction.save()
  validator.lastActivity = event.block.timestamp
  validator.save()
}

export function handlerAffirmationCompleted(event: AffirmationCompleted): void {
  const id = event.params.transactionHash
  let transaction = new XDAITransaction(id.toHexString())
  const executorId = event.transaction.from // executor address
  const executionId = transaction.id + '-' + executorId.toHexString()
  let execution = new TransactionExecution(executionId)

  let validator = Validator.load(executorId.toHexString())
  if (validator) {
    validator.lastActivity = event.block.timestamp
    validator.save()
    execution.executor = validator.id
  }
  execution.executorAddress = executorId
  execution.transaction = transaction.id
  execution.transactionHash = event.transaction.hash
  execution.timestamp = event.block.timestamp
  execution.save()

  transaction.bridgeName = 'XDAI'
  transaction.transactionStatus = 'COMPLETED'
  transaction.receiver = event.params.recipient
  transaction.receiverNetwork = dataSource.network()
  transaction.receiverAmount = event.params.value
  transaction.timestamp = event.block.timestamp
  transaction.execution = execution.id
  transaction.save()
}