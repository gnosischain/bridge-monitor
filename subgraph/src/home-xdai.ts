import { log, Address } from "@graphprotocol/graph-ts";
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
import {
  getHomeTxHashFromMessageMethod,
  xDAISignedForAffirmationData,
} from "./utils/xdai-bridge";
import { BRIDGE_XDAI, DAI_ADDRESS, loadValidator } from "./utils/misc";

//------------------
// Home > Foreign.
//------------------

// 1. The user initiates a bridging sending xDAI to the xDAIBridge.
export function handlerUserRequestForSignature(
  event: UserRequestForSignature
): void {
  const txHash = event.transaction.hash;
  const txValue = event.params.value;

  let transaction = new XDAITransaction(txHash.toHexString());
  transaction.transactionHash = txHash;
  transaction.messageId = txHash;
  transaction.bridgeName = "XDAI";
  transaction.transactionStatus = "INITIATED";
  transaction.timestamp = event.block.timestamp;

  transaction.initiatorNetwork = "gnosis";
  transaction.initiator = event.transaction.from;
  transaction.initiatorToken = Address.zero();
  transaction.initiatorAmount = txValue;

  transaction.receiverNetwork = "mainnet";
  transaction.receiver = event.params.recipient;
  transaction.receiverToken = Address.fromHexString(DAI_ADDRESS);
  transaction.receiverAmount = txValue;

  transaction.save();
}

// 2. The validators sign the bridging.
export function handlerSignedForUserRequest(event: SignedForUserRequest): void {
  const timestamp = event.block.timestamp;
  const validatorAddress = event.params.signer;

  // on 1. we create the transaction entity with the txHash as id
  // When a validator signs the transaction, the txHash used as id on 1 is not emitted.
  // We need to recover it by querying the xDai.message(messageHash) bridge contract method
  // using the messageHash emitted in this event.
  const xDai = HomeBridgeErcToNative.bind(event.address);
  const message = xDai.message(event.params.messageHash);
  const xDaiTxHash = getHomeTxHashFromMessageMethod(message);

  // get transaction or fail
  const transaction = XDAITransaction.load(xDaiTxHash);
  if (!transaction) {
    log.error(
      `XDAI:handlerSignedForUserRequest - tx not found id: {}, txHash {}`,
      [xDaiTxHash, event.transaction.hash.toHexString()]
    );
    return;
  }
  transaction.transactionStatus = "COLLECTING";
  transaction.save();

  // load validator or fail
  const validator = loadValidator(validatorAddress.toHexString(), BRIDGE_XDAI);
  if (!validator) {
    log.error(
      `XDAI:handlerSignedForUserRequest - Validator {} not found, txHash: {}`,
      [validatorAddress.toHexString(), event.transaction.hash.toHexString()]
    );
    return;
  }
  validator.lastActivity = timestamp;
  validator.save();

  // create validation
  const txValidation = new TransactionValidation(
    event.transaction.hash.toHexString()
  );
  txValidation.validator = validator.id;
  txValidation.transactionHash = event.transaction.hash;
  txValidation.transaction = xDaiTxHash;
  txValidation.validatorAddr = validatorAddress;
  txValidation.timestamp = timestamp;
  txValidation.save();
}

// 3. When all the signatures are collected.
// When this event happens, is possible to claim the tokens on the foreign network.
export function handlerCollectedSignatures(event: CollectedSignatures): void {
  // on 1. we create the transaction entity with the txHash as id
  // When a validator signs the transaction, the txHash used as id on 1 is not emitted.
  // We need to recover it by querying the xDai.message(messageHash) bridge contract method
  // using the messageHash emitted in this event.
  const xDai = HomeBridgeErcToNative.bind(event.address);
  const message = xDai.message(event.params.messageHash);
  const xDaiTxHash = getHomeTxHashFromMessageMethod(message);

  // get transaction or fail
  const transaction = XDAITransaction.load(xDaiTxHash);
  if (!transaction) {
    log.error(
      `XDAI:handlerCollectedSignatures - tx not found id: {}, txHash {}`,
      [xDaiTxHash, event.transaction.hash.toHexString()]
    );
    return;
  }
  transaction.transactionStatus = "UNCLAIMED";
  transaction.save();
}

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
    transaction.transactionHash = foreignTxHash;
    transaction.messageId = foreignTxHash;
    transaction.transactionStatus = "COLLECTING";

    transaction.initiatorNetwork = "mainnet";
    transaction.receiverNetwork = "gnosis";
    // initiator and receiver info
    xDAISignedForAffirmationData(transaction, transactionData);

    transaction.save();
  }

  // Load validator and update last activity
  // If no validator found, log error and interrupt execution
  let validator = loadValidator(signer, BRIDGE_XDAI);
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
  const validator = loadValidator(executorId.toHexString(), BRIDGE_XDAI);
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
  execution.transactionHash = event.transaction.hash;
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
