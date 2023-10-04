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
import { xDAISignedForAffirmationData } from "./utils/xdai";
import { mockXDAIValidators } from "./utils/mock-validators";

//------------------
// Home > Foreign.
//------------------

// export function handlerUserRequestForSignature(
//   event: UserRequestForSignature
// ): void {
//   const txHash = event.transaction.hash;
//   const txValue = event.params.value;
//   const sender = event.transaction.from;
//   const timestamp = event.block.timestamp;
//   const originNetwork = dataSource.network();

//   let transaction = new XDAITransaction(txHash.toHexString());
//   transaction.transactionHash = txHash;
//   transaction.bridgeName = "XDAI";
//   transaction.initiator = sender;
//   transaction.initiatorAmount = txValue;
//   transaction.initiatorNetwork = originNetwork;
//   transaction.receiverNetwork = "mainnet";
//   transaction.receiverAmount = txValue;
//   transaction.transactionStatus = "INITIATED";
//   transaction.timestamp = timestamp;
//   transaction.save();
// }

// export function handlerSignedForUserRequest(event: SignedForUserRequest): void {
//   const contract = HomeBridgeErcToNative.bind(event.address);
//   const messageHash = event.params.messageHash;
//   const message = contract.message(messageHash);
//   const messageHashContent = parseMessage(message.toHexString());
//   const timestamp = event.block.timestamp;
//   const validationHash = event.transaction.hash;
//   const transactionId = messageHashContent[2];
//   const originNetwork = dataSource.network();

//   let transaction = XDAITransaction.load(transactionId);
//   if (!transaction) {
//     log.error(
//       `Transaction NOT FOUND ${transactionId} @handlerSignedForUserRequest`,
//       []
//     );
//     transaction = new XDAITransaction(transactionId);
//   }

//   const signer = event.params.signer; // validator address
//   let validator = Validator.load(signer.toHexString());
//   if (!validator) {
//     log.error(
//       `Validator ${signer.toHexString()} not found @handlerSignedForUserRequest-homeXDAI`,
//       []
//     );
//   } else {
//     const validatorId = validator.id;
//     const txValidationId = transactionId + "-" + validatorId;
//     let txValidation = new TransactionValidation(txValidationId);
//     txValidation.validator = validatorId;
//     txValidation.transactionHash = validationHash;
//     txValidation.transaction = transactionId;
//     txValidation.timestamp = timestamp;
//     txValidation.save();

//     validator.lastActivity = timestamp;
//     validator.save();
//   }
//   transaction.bridgeName = "XDAI";
//   transaction.initiatorNetwork = originNetwork;
//   transaction.receiverNetwork = "mainnet";
//   transaction.transactionStatus = "COLLECTING";
//   // transaction.timestamp = timestamp // @todo remove or make it specific to Last Signature added event
//   transaction.save();
// }

//------------------
// Foreign > Home.
//------------------

// 1. A users initiates a bridging in the foreign network.
// >> foreign

// 2. SignedForAffirmation.
// A validator signs an affirmation (saying the operation is valid).
// This is the first event the home is aware of.
export function handlerSignedForAffirmation(event: SignedForAffirmation): void {
  const foreignTxHash = event.params.transactionHash;
  const foreignTxHashString = event.params.transactionHash.toHexString();
  const transactionData = event.transaction.input.toHexString();
  const signer = event.params.signer.toHexString(); // validator address

  // Try to load tx, as it might be the first validator signing it we might need to create it
  let transaction = XDAITransaction.load(foreignTxHashString);
  if (!transaction) {
    transaction = new XDAITransaction(foreignTxHashString);
    transaction.bridgeName = "XDAI";
    transaction.initiatorNetwork = "mainnet";
    transaction.transactionHash = foreignTxHash;
    transaction.messageId = foreignTxHash;
    // Set receiver y receiverAmount by processing the event SignedForAffirmationData
    xDAISignedForAffirmationData(transaction, transactionData);
    transaction.receiverNetwork = "gnosis";
    transaction.transactionStatus = "COLLECTING";
    transaction.save();
  }

  // Load validator and update last activity
  // If no validator found, log error and interrupt execution
  mockXDAIValidators();
  let validator = Validator.load(signer);
  if (!validator) {
    log.error(
      `XDAI:handlerSignedForAffirmation - Validator {} not found, txHash: {}`,
      [signer, foreignTxHash.toHexString()]
    );
    return;
  }
  validator.lastActivity = event.block.timestamp;
  validator.save();

  // Create validation entity
  const txValidationId = foreignTxHashString + "-" + validator.id;
  let txValidation = new TransactionValidation(txValidationId);
  txValidation.validator = validator.id;
  txValidation.validatorAddr = validator.address;
  txValidation.transactionHash = event.transaction.hash;
  txValidation.transaction = foreignTxHashString;
  txValidation.timestamp = event.block.timestamp;
  txValidation.save();
}

// 3. AffirmationCompleted.
// This event is triggered when after threshold of validators signatures is reached.
// and the funds are minted on home side.
// txExample: https://gnosisscan.io/tx/0xb431ceba6b6ac480ab6127429251ac621f79cd1292a83c255146c79bd8600960#eventlog
export function handlerAffirmationCompleted(event: AffirmationCompleted): void {
  const foreignTxHash = event.params.transactionHash;
  const foreignTxHashString = foreignTxHash.toHexString();
  const executorId = event.transaction.from; // validator address

  // Load validator and update last activity
  const validator = Validator.load(executorId.toHexString());
  if (!validator) {
    log.error(
      `XDAI:handlerSignedForAffirmation - Validator {} not found, txHash: {}`,
      [executorId.toHexString(), foreignTxHash.toHexString()]
    );
    return;
  }
  validator.lastActivity = event.block.timestamp;
  validator.save();

  // Create execution entity
  const execution = new TransactionExecution(foreignTxHashString);
  execution.executor = executorId.toHexString();
  execution.validatorAddr = validator.address;
  execution.transaction = foreignTxHashString;
  execution.transactionHash = foreignTxHash;
  execution.timestamp = event.block.timestamp;
  execution.save();

  // Link execution to transaction
  let transaction = XDAITransaction.load(foreignTxHashString);
  if (!transaction) {
    log.error(
      `XDAI:handlerSignedForAffirmation - Transaction not found, txHash: {}`,
      [foreignTxHash.toHexString()]
    );
    return;
  }
  transaction.transactionStatus = "COMPLETED";
  transaction.execution = foreignTxHashString;
  transaction.save();
}