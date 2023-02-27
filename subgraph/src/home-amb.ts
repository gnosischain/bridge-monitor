import { dataSource, Address, log } from "@graphprotocol/graph-ts"
import { AffirmationCompleted, CollectedSignatures, HomeAMB, SignedForAffirmation, SignedForUserRequest, UserRequestForSignature } from "../generated/HomeAMB/HomeAMB"
import { AMBTransaction, TransactionExecution, TransactionValidation, Validator } from "../generated/schema"
import { parseAMBMessageHash, parseAMBEncodedData, isOmniBridgeUsage, parseAMBTransactionInput, isAffirmationFromOmnibridge, isFromOmniBridgeUsage } from "./message"

export function handlerUserRequestForSignatureEvent(event: UserRequestForSignature): void {
  // UserRequestForSignature (index_topic_1 bytes32 messageId, bytes encodedData)
  const transactionHash = event.transaction.hash
  const timestamp = event.block.timestamp
  const messageId = event.params.messageId
  const message = event.params.encodedData.toHexString()
  const network = dataSource.network()

  if (isOmniBridgeUsage(message)) {
    const messageContent = parseAMBEncodedData(message)
    let transaction = new AMBTransaction(messageId.toHexString())
    transaction.bridgeName = 'AMB'
    transaction.messageId = messageId
    transaction.initiatorNetwork = network
    transaction.receiver = Address.fromHexString(messageContent[2])
    transaction.receiverToken = Address.fromHexString(messageContent[1])
    transaction.receiverNetwork = 'mainnet'
    transaction.transactionStatus = 'REQUESTED'
    transaction.timestamp = timestamp
    transaction.save()
  }
}

export function handlerSignedForUserRequest(event: SignedForUserRequest): void {
  // SignedForUserRequest (index_topic_1 address signer, bytes32 messageHash)
  const contract = HomeAMB.bind(event.address)
  const messageHash = event.params.messageHash
  const message = contract.message(messageHash).toHexString()
  const signer = event.params.signer // validator !!
  const signerString = signer.toHexString()
  const transactionHash = event.transaction.hash
  const timestamp = event.block.timestamp
  
  if (isOmniBridgeUsage(message)) {
    const messageId = parseAMBMessageHash(message)
    let transaction = AMBTransaction.load(messageId)
    if (!transaction) {
      log.error(`Transaction NOT FOUND ${messageId} @handlerSignedForAffirmation`, [])
      transaction = new AMBTransaction(messageId)
    }
    log.error(`Transaction FOUND ${messageId} @handlerSignedForAffirmation`, [])

    let validator = Validator.load(signerString)
    if (!validator) {
      log.error(`Validator ${signerString} not found @handlerSignedForUserRequest-homeAMB`, [])
    } else {
      const txValidationId = messageId + '-' + signerString
      let txValidation = new TransactionValidation(txValidationId)
      txValidation.validator = validator.id
      txValidation.responsableAddress = signer
      txValidation.transactionHash = transactionHash
      txValidation.transaction = messageId
      txValidation.timestamp = timestamp
      txValidation.save()

      validator.lastActivity = timestamp
      validator.save()
    }
    transaction.bridgeName = 'AMB'
    transaction.initiatorNetwork = dataSource.network()
    transaction.receiverNetwork = 'mainnet'
    transaction.transactionStatus = "COLLECTING"
    // transaction.timestamp = timestamp // @todo remove or make it specific to Last Signature added event
    transaction.save()
  }
}

export function handlerSignedForAffirmation(event: SignedForAffirmation): void {
  const transactionHash = event.transaction.hash
  const signer = event.params.signer // validator !!
  const signerString = signer.toHexString()
  const transactionData = event.transaction.input.toHexString()
  const timestamp = event.block.timestamp
  
  if (isAffirmationFromOmnibridge(transactionData)) {
    const messageId = parseAMBTransactionInput(transactionData)
    let transaction = AMBTransaction.load(messageId)
    if (!transaction) {
      log.error(`Transaction NOT FOUND ${messageId} @handlerSignedForAffirmation`, [])
      transaction = new AMBTransaction(messageId)
    }
    log.error(`Transaction FOUND ${messageId} @handlerSignedForAffirmation`, [])

    let validator = Validator.load(signerString)
    if (!validator) {
      log.error(`Validator ${signerString} not found @handlerSignedForAffirmation-homeAMB`, [])
    } else {
      const txValidationId = messageId + '-' + signerString
      let txValidation = new TransactionValidation(txValidationId)
      txValidation.validator = validator.id
      txValidation.responsableAddress = signer
      txValidation.transactionHash = transactionHash
      txValidation.transaction = messageId
      txValidation.timestamp = timestamp
      txValidation.save()

      validator.lastActivity = timestamp
      validator.save()
    }
    transaction.bridgeName = 'AMB'
    transaction.initiatorNetwork = 'mainnet'
    transaction.receiverNetwork = dataSource.network()
    transaction.transactionStatus = "COLLECTING"
    // transaction.timestamp = timestamp // @todo remove or make it specific to Last Signature added event
    transaction.save()
  }

}

export function handlerCollectedSignatures(event: CollectedSignatures): void {
  // CollectedSignatures (address authorityResponsibleForRelay, bytes32 messageHash, uint256 NumberOfCollectedSignatures)
  const messageHash = event.params.messageHash
  const contract = HomeAMB.bind(event.address)
  const message = contract.message(messageHash).toHexString() // can be decoded with HOMEAMB message method
  const messageId = parseAMBMessageHash(message)
  const timestamp = event.block.timestamp

  if (isOmniBridgeUsage(message)) {
    let transaction = AMBTransaction.load(messageId)
    if (!transaction) {
      log.error(`Transaction NOT FOUND ${messageId} @handlerCollectedSignatures`, [])
      transaction = new AMBTransaction(messageId)
    }
    log.error(`Transaction FOUND ${messageId} @handlerCollectedSignatures`, [])

    const executorId = event.params.authorityResponsibleForRelay // validator address
    const executionId = messageId + '-' + executorId.toHexString()
    let execution = new TransactionExecution(executionId)
    let validator = Validator.load(executorId.toHexString())
    if (!validator) {
      log.error(`Validator ${executorId} not found @handlerCollectedSignatures-homeXDAI`, [])
    } else {
      execution.executor = validator.id
      validator.lastActivity = timestamp
      validator.save()
    }
    execution.responsableAddress = executorId
    execution.transaction = messageId
    execution.transactionHash = event.transaction.hash
    execution.timestamp = timestamp
    execution.save()

    transaction.bridgeName = 'AMB'
    transaction.initiatorNetwork = dataSource.network()
    transaction.receiverNetwork = 'mainnet'
    transaction.transactionStatus = "UNCLAIMED"
    // transaction.timestamp = timestamp // @todo remove or make it specific to Sigs Reached event
    transaction.save()
  }
}

export function handlerAffirmationCompleted(event: AffirmationCompleted): void {
  // AffirmationCompleted (index_topic_1 address sender, index_topic_2 address executor, index_topic_3 bytes32 messageId, bool status)
  const timestamp = event.block.timestamp
  const messageId = event.params.messageId.toString()
  const sender = event.params.sender.toHexString() // foreignMediator
  const executor = event.params.executor.toHexString() // homeMediator

  if (isFromOmniBridgeUsage(executor, sender)) {
    let transaction = AMBTransaction.load(messageId)
    if (!transaction) {
      log.error(`Transaction NOT FOUND ${messageId} @handlerAffirmationCompleted`, [])
      transaction = new AMBTransaction(messageId)
    }
    log.error(`Transaction FOUND ${messageId} @handlerAffirmationCompleted`, [])
    
    const executorId = executor // validator address
    const executionId = messageId + '-' + executorId
    let execution = new TransactionExecution(executionId)
    let validator = Validator.load(executorId)
    if (!validator) {
      log.error(`Validator ${executorId} not found @handlerCollectedSignatures-homeXDAI`, [])
    } else {
      execution.executor = validator.id
      validator.lastActivity = timestamp
      validator.save()
    }
    execution.responsableAddress = Address.fromHexString(executorId)
    execution.transaction = messageId
    execution.transactionHash = event.transaction.hash
    execution.timestamp = timestamp
    execution.save()

    transaction.bridgeName = 'AMB'
    transaction.initiatorNetwork = 'mainnet'
    transaction.receiverNetwork = dataSource.network()
    transaction.transactionStatus = "UNCLAIMED"
    // transaction.timestamp = timestamp // @todo remove or make it specific to Sigs Reached event
    transaction.save()
  }
}
