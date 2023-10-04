import { Address, dataSource, log } from "@graphprotocol/graph-ts";
import {
  AffirmationCompleted,
  CollectedSignatures,
  HomeBridgeErcToNative,
  SignedForAffirmation,
  SignedForUserRequest,
  UserRequestForSignature,
} from "../generated/HomeBridgeErcToNative/HomeBridgeErcToNative";
import {
  TransactionExecution,
  TransactionValidation,
  Validator,
  XDAITransaction,
} from "../generated/schema";
import { parseMessage } from "./utils/message";

export function handlerUserRequestForSignature(
  event: UserRequestForSignature
): void {
  const txHash = event.transaction.hash;
  const txValue = event.params.value;
  const sender = event.transaction.from;
  const timestamp = event.block.timestamp;
  const originNetwork = dataSource.network();

  let transaction = new XDAITransaction(txHash.toHexString());
  transaction.transactionHash = txHash;
  transaction.bridgeName = "XDAI";
  transaction.initiator = sender;
  transaction.initiatorAmount = txValue;
  transaction.initiatorNetwork = originNetwork;
  transaction.receiverNetwork = "mainnet";
  transaction.receiverAmount = txValue;
  transaction.transactionStatus = "INITIATED";
  transaction.timestamp = timestamp;
  transaction.save();
}

export function handlerSignedForUserRequest(event: SignedForUserRequest): void {
  const contract = HomeBridgeErcToNative.bind(event.address);
  const messageHash = event.params.messageHash;
  const message = contract.message(messageHash);
  const messageHashContent = parseMessage(message.toHexString());
  const timestamp = event.block.timestamp;
  const validationHash = event.transaction.hash;
  const transactionId = messageHashContent[2];
  const originNetwork = dataSource.network();

  let transaction = XDAITransaction.load(transactionId);
  if (!transaction) {
    log.error(
      `Transaction NOT FOUND ${transactionId} @handlerSignedForUserRequest`,
      []
    );
    transaction = new XDAITransaction(transactionId);
  }

  const signer = event.params.signer; // validator address
  let validator = Validator.load(signer.toHexString());
  if (!validator) {
    log.error(
      `Validator ${signer.toHexString()} not found @handlerSignedForUserRequest-homeXDAI`,
      []
    );
  } else {
    const validatorId = validator.id;
    const txValidationId = transactionId + "-" + validatorId;
    let txValidation = new TransactionValidation(txValidationId);
    txValidation.validator = validatorId;
    txValidation.transactionHash = validationHash;
    txValidation.transaction = transactionId;
    txValidation.timestamp = timestamp;
    txValidation.save();

    validator.lastActivity = timestamp;
    validator.save();
  }
  transaction.bridgeName = "XDAI";
  transaction.initiatorNetwork = originNetwork;
  transaction.receiverNetwork = "mainnet";
  transaction.transactionStatus = "COLLECTING";
  // transaction.timestamp = timestamp // @todo remove or make it specific to Last Signature added event
  transaction.save();
}

export function handlerSignedForAffirmation(event: SignedForAffirmation): void {
  const transactionId = event.params.transactionHash.toHexString();
  const timestamp = event.block.timestamp;
  const destinationNetwork = dataSource.network();
  const validationHash = event.transaction.hash;
  let transaction = XDAITransaction.load(transactionId);
  if (!transaction) {
    log.error(
      `Transaction NOT FOUND ${transactionId} @handlerSignedForAffirmation`,
      []
    );
    transaction = new XDAITransaction(transactionId);
  }

  const signer = event.params.signer; // validator address
  let validator = Validator.load(signer.toHexString());
  if (!validator) {
    log.error(
      `Validator ${signer.toHexString()} not found @handlerSignedForAffirmation-homeXDAI`,
      []
    );
  } else {
    const validatorId = validator.id;
    const txValidationId = transactionId + "-" + validatorId;
    let txValidation = new TransactionValidation(txValidationId);
    txValidation.validator = validatorId;
    txValidation.transactionHash = validationHash;
    txValidation.transaction = transactionId;
    txValidation.timestamp = timestamp;
    txValidation.save();

    validator.lastActivity = timestamp;
    validator.save();
  }
  transaction.bridgeName = "XDAI";
  transaction.initiatorNetwork = "mainnet";
  transaction.receiverNetwork = destinationNetwork;
  transaction.transactionStatus = "COLLECTING";
  // transaction.timestamp = timestamp // @todo remove or make it specific to Last Signature added event
  transaction.save();
}

export function handlerCollectedSignatures(event: CollectedSignatures): void {
  const contract = HomeBridgeErcToNative.bind(event.address);
  const messageHash = event.params.messageHash;
  const message = contract.message(messageHash);
  const messageHashContent = parseMessage(message.toHexString());

  const recipient = messageHashContent[0];
  // const amount = messageHashContent[1]
  const transactionId = messageHashContent[2];
  const timestamp = event.block.timestamp;
  const executionHash = event.transaction.hash;

  const executorId = event.params.authorityResponsibleForRelay; // validator address
  const executionId = transactionId + "-" + executorId.toHexString();
  let execution = new TransactionExecution(executionId);
  let validator = Validator.load(executorId.toHexString());
  if (!validator) {
    log.error(
      `Validator ${executorId} not found @handlerCollectedSignatures-homeXDAI`,
      []
    );
  } else {
    execution.executor = validator.id;
    validator.lastActivity = timestamp;
    validator.save();
  }
  execution.transaction = transactionId;
  execution.transactionHash = executionHash;
  execution.timestamp = timestamp;
  execution.save();

  let transaction = XDAITransaction.load(transactionId);
  if (!transaction) {
    log.error(
      `Transaction NOT FOUND ${transactionId} @handlerCollectedSignatures`,
      []
    );
    transaction = new XDAITransaction(transactionId);
  }

  transaction.bridgeName = "XDAI";
  transaction.transactionStatus = "UNCLAIMED";
  transaction.initiatorNetwork = dataSource.network();
  transaction.receiver = Address.fromHexString(recipient);
  transaction.receiverNetwork = "mainnet";
  // transaction.receiverAmount = BigInt.fromString(amount)
  // transaction.timestamp = timestamp // @todo remove or make it specific to Sigs Reached event
  transaction.execution = execution.id;
  transaction.save();
}

export function handlerAffirmationCompleted(event: AffirmationCompleted): void {
  const txValue = event.params.value;
  const txHash = event.params.transactionHash;
  const recipient = event.params.recipient;
  const transactionId = txHash.toHexString();
  const timestamp = event.block.timestamp;
  const executionHash = event.transaction.hash;

  const executorId = event.transaction.from; // executor address
  const executionId = transactionId + "-" + executorId.toHexString();
  let execution = new TransactionExecution(executionId);
  let validator = Validator.load(executorId.toHexString());
  if (!validator) {
    log.error(
      `Validator ${executorId.toHexString()} not found @handlerAffirmationCompleted-homeXDAI`,
      []
    );
  } else {
    execution.executor = executorId.toHexString();
    validator.lastActivity = timestamp;
    validator.save();
  }
  execution.transaction = transactionId;
  execution.transactionHash = executionHash;
  execution.timestamp = timestamp;
  execution.save();

  let transaction = XDAITransaction.load(transactionId);
  if (!transaction) {
    log.error(
      `Transaction NOT FOUND ${transactionId} @handlerAffirmationCompleted`,
      []
    );
    transaction = new XDAITransaction(transactionId);
  }

  transaction.bridgeName = "XDAI";
  transaction.transactionStatus = "UNCLAIMED";
  transaction.receiver = recipient;
  transaction.receiverNetwork = dataSource.network();
  transaction.receiverAmount = txValue;
  // transaction.timestamp = timestamp // @todo remove or make it specific to Sigs Reached event
  transaction.execution = executionId;
  transaction.save();
}
