import { dataSource, Address } from "@graphprotocol/graph-ts"
import { AffirmationCompleted, CollectedSignatures, HomeAMB, SignedForAffirmation, SignedForUserRequest, UserRequestForSignature } from "../generated/HomeAMB/HomeAMB"
import { AMBTransaction, TransactionValidation, Validator } from "../generated/schema"
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
    let transaction = new AMBTransaction(messageId)
    // let validator = Validator.load(signerString)
    // if (!validator) {
    //   log.error(`Validator ${signerString} not found @handlerSignedForUserRequest-homeAMB`, [])
    // } else {
    //   const txValidationId = messageId + '-' + signerString
    //   let txValidation = new TransactionValidation(txValidationId)
    //   txValidation.validator = validator.id
    //   txValidation.validatorAddress = signer
    //   txValidation.transactionHash = transactionHash
    //   txValidation.transaction = messageId
    //   txValidation.timestamp = timestamp
    //   txValidation.save()

    //   validator.lastActivity = timestamp
    //   validator.save()
    // }
    transaction.bridgeName = 'AMB'
    transaction.transactionStatus = "COLLECTING"
    transaction.timestamp = timestamp
    transaction.save()
  }
}

export function handlerSignedForAffirmation(event: SignedForAffirmation): void {
  const transactionHash = event.transaction.hash
  const timestamp = event.block.timestamp
  const signer = event.params.signer // validator !!
  const signerString = signer.toHexString()
  const transactionData = event.transaction.input.toHexString()
  
  if (isAffirmationFromOmnibridge(transactionData)) {
    const messageId = parseAMBTransactionInput(transactionData)
    let transaction = new AMBTransaction(messageId)
    // let validator = Validator.load(signerString)
    // if (!validator) {
    //   log.error(`Validator ${signerString} not found @handlerSignedForAffirmation-homeAMB`, [])
    // } else {
    //   const txValidationId = messageId + '-' + signerString
    //   let txValidation = new TransactionValidation(txValidationId)
    //   txValidation.validator = validator.id
    //   txValidation.validatorAddress = signer
    //   txValidation.transactionHash = transactionHash
    //   txValidation.transaction = messageId
    //   txValidation.timestamp = timestamp
    //   txValidation.save()

    //   validator.lastActivity = timestamp
    //   validator.save()
    // }
    transaction.bridgeName = 'AMB'
    transaction.transactionStatus = "COLLECTING"
    transaction.timestamp = timestamp
    transaction.save()
  }

}

export function handlerCollectedSignatures(event: CollectedSignatures): void {
  // CollectedSignatures (address authorityResponsibleForRelay, bytes32 messageHash, uint256 NumberOfCollectedSignatures)
  const timestamp = event.block.timestamp
  const messageHash = event.params.messageHash
  const contract = HomeAMB.bind(event.address)
  const message = contract.message(messageHash).toHexString() // can be decoded with HOMEAMB message method
  const messageId = parseAMBMessageHash(message)

  if (isOmniBridgeUsage(message)) {
    let transaction = new AMBTransaction(messageId)

    const executorId = event.params.authorityResponsibleForRelay // validator address
    const executionId = messageId + '-' + executorId.toHexString()
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




    transaction.bridgeName = 'AMB'
    transaction.transactionStatus = "UNCLAIMED"
    transaction.timestamp = timestamp
    transaction.save()
  }
}

export function handlerAffirmationCompleted(event: AffirmationCompleted): void {
  // AffirmationCompleted (index_topic_1 address sender, index_topic_2 address executor, index_topic_3 bytes32 messageId, bool status)
  const timestamp = event.block.timestamp
  const messageId = event.params.messageId.toString()
  const sender = event.params.sender.toHexString()
  const executor = event.params.executor.toHexString()

  if (isFromOmniBridgeUsage(executor, sender)) {
    let transaction = new AMBTransaction(messageId)
    transaction.bridgeName = 'AMB'
    transaction.transactionStatus = "UNCLAIMED"
    transaction.timestamp = timestamp
    transaction.save()
  }
}
