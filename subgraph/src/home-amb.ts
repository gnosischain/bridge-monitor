import { Bytes, dataSource } from "@graphprotocol/graph-ts"
import { AffirmationCompleted, CollectedSignatures, HomeAMB, SignedForAffirmation, SignedForUserRequest, UserRequestForSignature } from "../generated/HomeAMB/HomeAMB"
import { AMBTransaction, TransactionValidation, Validator } from "../generated/schema"
import { parseAMBMessage } from "./message"

export function handlerUserRequestForSignatureEvent(event: UserRequestForSignature): void {
  const transactionHash = event.transaction.hash
  const timestamp = event.block.timestamp
  const messageId = event.params.messageId
  const message = event.params.encodedData.toHexString()

  const network = dataSource.network()

  let transaction = new AMBTransaction(messageId.toHexString())

  const parsed = parseAMBMessage(message)
  const sender = parsed[1]
  transaction.bridgeName = "AMB"
  transaction.messageId = messageId
  transaction.transactionHash = transactionHash
  transaction.initiator = Bytes.fromHexString(sender)
  transaction.initiatorNetwork = network
  transaction.transactionStatus = "INITIATED"
  transaction.timestamp = timestamp

  transaction.save()
}

export function handlerSignedForUserRequest(event: SignedForUserRequest): void {
  const transactionHash = event.transaction.hash
  const timestamp = event.block.timestamp
  const signer = event.params.signer
  const messageHash = event.params.messageHash
  const contract = HomeAMB.bind(event.address)
  const message = contract.message(messageHash).toHexString()

  const parsed = parseAMBMessage(message)
  const messageId = parsed[0]

  const txValidationId = messageId + '-' + signer.toHexString()
  let txValidation = new TransactionValidation(txValidationId)

  let validator = Validator.load(signer.toHexString())
  if (validator) {
    validator.lastActivity = timestamp
    validator.save()
    txValidation.validator = validator.id
    txValidation.validatorAddress = signer
  }
  txValidation.transactionHash = transactionHash
  txValidation.transaction = messageId
  txValidation.timestamp = timestamp
  txValidation.save()

  let transaction = new AMBTransaction(messageId)
  transaction.transactionStatus = "PENDING"
  transaction.save()
}

export function handlerSignedForAffirmation(event: SignedForAffirmation): void {
  const transactionHash = event.transaction.hash
  const timestamp = event.block.timestamp
  const signer = event.params.signer
  const messageHash = event.params.messageHash
  const contract = HomeAMB.bind(event.address)
  const message = contract.message(messageHash).toHexString()

  const parsed = parseAMBMessage(message)
  const messageId = parsed[0]

  const txValidationId = messageId + '-' + signer.toHexString()
  let txValidation = new TransactionValidation(txValidationId)

  let validator = Validator.load(signer.toHexString())
  if (validator) {
    validator.lastActivity = timestamp
    validator.save()
    txValidation.validator = validator.id
    txValidation.validatorAddress = signer
  }
  txValidation.transactionHash = transactionHash
  txValidation.transaction = messageId
  txValidation.timestamp = timestamp
  txValidation.save()

  let transaction = new AMBTransaction(messageId)
  transaction.transactionStatus = "PENDING"
  transaction.save()
}

export function handlerCollectedSignatures(event: CollectedSignatures): void {
  const messageHash = event.params.messageHash
  const contract = HomeAMB.bind(event.address)
  const message = contract.message(messageHash).toHexString()
  const parsed = parseAMBMessage(message)
  const messageId = parsed[0]

  let transaction = new AMBTransaction(messageId)
  transaction.transactionStatus = "COMPLETED"
  transaction.save()
}

export function handlerAffirmationCompleted(event: AffirmationCompleted): void {
  const messageId = event.params.messageId.toString()

  let transaction = new AMBTransaction(messageId)
  transaction.transactionStatus = "COMPLETED"
  transaction.save()
}
