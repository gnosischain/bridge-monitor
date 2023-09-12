import { Bytes, dataSource, log } from "@graphprotocol/graph-ts";
import {
  AffirmationCompleted,
  CollectedSignatures,
  HomeAMB,
  SignedForAffirmation,
  SignedForUserRequest,
} from "../generated/HomeAMB/HomeAMB";
import {
  AMBTransaction,
  TransactionExecution,
  TransactionValidation,
  Validator,
} from "../generated/schema";
import {
  parseAMBMessageHash,
  isOmniBridgeUsage,
  parseAMBTransactionInput,
  isAffirmationFromOmnibridge,
  isFromOmniBridgeUsageNew,
  parseAMBTransactionInputForTelepathy,
} from "./message";
import { telepathyAddress } from "./utils";

//-------------------------
// Home > Foreign
// When operation is initiated in home > Signature events are called
//-------------------------

// 1. The bridge operation starts when the user sends tokens to the omnibridge.
// check omnibridge-mediators.ts > handlerTokensBridgingInitiated. it creates the transaction entity

// 2. The validators sign the operation
// SignedForUserRequest (index_topic_1 address signer, bytes32 messageHash)
export function handlerSignedForUserRequest(event: SignedForUserRequest): void {
  const contract = HomeAMB.bind(event.address);
  const messageHash = event.params.messageHash;
  const message = contract.message(messageHash).toHexString();
  const signer = event.params.signer; // validator !!
  const signerString = signer.toHexString();
  const transactionHash = event.transaction.hash;
  const timestamp = event.block.timestamp;

  // There are some operations that are not for an ERC20 bridge.
  // We need to filter them out as they are out of scope.
  if (!isOmniBridgeUsage(message)) {
    return;
  }

  // update transaction
  const messageId = parseAMBMessageHash(message);
  let transaction = AMBTransaction.load(messageId);
  if (!transaction) {
    log.error(
      `handlerSignedForUserRequest: Transaction NOT FOUND {} - txHash: {}`,
      [messageId, transactionHash.toHexString()]
    );
    return;
  }
  transaction.transactionStatus = "COLLECTING";
  transaction.save();

  // load validator
  let validator = Validator.load(signerString);
  if (!validator) {
    log.error(
      `handlerSignedForUserRequest: Validator {} NOT FOUND - txHash: {}`,
      [signerString, transactionHash.toHexString()]
    );
    return;
  }
  validator.lastActivity = timestamp;
  validator.save();

  // save validation
  const txValidationId = messageId + "-" + signerString;
  let txValidation = new TransactionValidation(txValidationId);
  txValidation.validator = validator.id;
  txValidation.responsableAddress = signer;
  txValidation.transactionHash = transactionHash;
  txValidation.transaction = messageId;
  txValidation.timestamp = timestamp;
  txValidation.save();
}

// 3. When the threshold of signatures is reached.
// CollectedSignatures (address authorityResponsibleForRelay, bytes32 messageHash, uint256 NumberOfCollectedSignatures)
export function handlerCollectedSignatures(event: CollectedSignatures): void {
  const messageHash = event.params.messageHash;
  const contract = HomeAMB.bind(event.address);
  const message = contract.message(messageHash).toHexString(); // can be decoded with HOMEAMB message method
  const messageId = parseAMBMessageHash(message);
  const timestamp = event.block.timestamp;
  const executorId = event.params.authorityResponsibleForRelay; // validator address

  if (!isOmniBridgeUsage(message)) {
    return;
  }

  // load transaction
  let transaction = AMBTransaction.load(messageId);
  if (!transaction) {
    log.error(
      `handlerCollectedSignatures: Transaction {} NOT FOUND - txHash: {}`,
      [messageId, event.transaction.hash.toHexString()]
    );
    return;
  }
  transaction.transactionStatus = "UNCLAIMED";
  transaction.save();

  // load validator
  let validator = Validator.load(executorId.toHexString());
  if (!validator) {
    log.error(
      `handlerCollectedSignatures: Validator {} NOT FOUND - txHash: {}`,
      [executorId.toHexString(), event.transaction.hash.toHexString()]
    );
    return;
  }
  validator.lastActivity = timestamp;
  validator.save();

  // Execution
  const executionId = messageId + "-" + executorId.toHexString();
  let execution = new TransactionExecution(executionId);
  execution.executor = validator.id;
  execution.responsableAddress = executorId;
  execution.transaction = messageId;
  execution.transactionHash = event.transaction.hash;
  execution.timestamp = timestamp;
  execution.save();
}

//-------------------------
// Foreign > Home
// When operation is initiated in foreign > Affirmation events are collected
//-------------------------

// 1. executeAffirmation() > SignedForAffirmation.
// A user initiated a bridge from Foreign to Home.
// This is the first event the home is aware of.
// It is triggered when a validator signs an affirmation (saying the operation is valid).
export function handlerSignedForAffirmation(event: SignedForAffirmation): void {
  const transactionHash = event.transaction.hash;
  const timestamp = event.block.timestamp;
  const signer = event.params.signer;
  const signerString = signer.toHexString();
  const transactionData = event.transaction.input.toHexString();

  // There are some operations that are not for an ERC20 bridge.
  // We need to filter them out as they are out of scope.
  if (!isAffirmationFromOmnibridge(transactionData)) {
    return;
  }

  // if signer is Telepathy, txData has to be processed with different indexes
  const messageId =
    signerString == telepathyAddress
      ? parseAMBTransactionInputForTelepathy(event.receipt)
      : parseAMBTransactionInput(transactionData);

  if (messageId.length == 0) {
    log.error(`handlerSignedForAffirmation: MessageId is null - hash: {}`, [
      event.transaction.hash.toHexString(),
    ]);
    return;
  }

  // Get or create transaction (as it might have be created by a previous validator)
  let transaction = AMBTransaction.load(messageId);
  if (!transaction) {
    transaction = new AMBTransaction(messageId);
    transaction.timestamp = timestamp;
    transaction.bridgeName = "AMB";
    transaction.initiatorNetwork = "mainnet";
    transaction.receiverNetwork = dataSource.network();
    transaction.transactionStatus = "COLLECTING";
    transaction.save();
  }

  // load validator
  let validator = Validator.load(signerString);
  if (!validator) {
    log.error(
      `handlerSignedForAffirmation: Validator {} NOT FOUND - hash: {}`,
      [signerString, event.transaction.hash.toHexString()]
    );
    return;
  }

  // save validator signature
  const txValidationId = event.transaction.hash.toHexString();
  let txValidation = new TransactionValidation(txValidationId);
  txValidation.validator = validator.id;
  txValidation.responsableAddress = signer;
  txValidation.transactionHash = transactionHash;
  txValidation.transaction = messageId;
  txValidation.timestamp = timestamp;
  txValidation.save();

  // update validator
  validator.lastActivity = timestamp;
  validator.save();
}

// 2. on the home side, claims happen automatically when the threshold of validators signatures is reached
// check omnibridge-mediators.ts > handlerTokensBridged. it sets the transaction as "COMPLETED"

// 3. executeAffirmation() > AffirmationCompleted.
// Here we create the execution and assign it to the tx.
// AffirmationCompleted (index_topic_1 address sender, index_topic_2 address executor, index_topic_3 bytes32 messageId, bool status)
export function handlerAffirmationCompleted(event: AffirmationCompleted): void {
  event.transaction.from;
  const sender = event.params.sender.toHexString(); // foreignMediator
  const executor = event.params.executor.toHexString(); // homeMediator
  const timestamp = event.block.timestamp;
  const messageId = event.params.messageId.toHexString();

  // There are some operations that are not for an ERC20 bridge.
  // We need to filter them out as they are out of scope.
  if (!isFromOmniBridgeUsageNew(sender, executor)) {
    return;
  }

  // create execution
  const executionId = messageId + "-" + executor;
  const execution = new TransactionExecution(executionId);
  execution.responsableAddress = event.params.executor;
  execution.transaction = messageId;
  execution.transactionHash = event.transaction.hash;
  execution.timestamp = timestamp;
  // the last signature collected happens on the same tx as handlerAffirmationCompleted event.
  // TransactionValidation uses the txHash as id, so we need to load it here.
  // and get the validator from it.
  const validation = TransactionValidation.load(
    event.transaction.hash.toHexString()
  );
  if (validation) {
    execution.responsableAddress = Bytes.fromHexString(validation.validator);
  }
  execution.save();

  // save transaction
  const transaction = AMBTransaction.load(messageId);
  if (!transaction) {
    log.error(
      `handlerAffirmationCompleted: Transaction {} NOT FOUND - hash: {}`,
      [messageId, event.transaction.hash.toHexString()]
    );
    return;
  }
  transaction.execution = execution.id;
  transaction.save();
}
