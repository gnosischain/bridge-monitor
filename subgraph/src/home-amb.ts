import { Bytes, dataSource, log } from "@graphprotocol/graph-ts";
import {
  AffirmationCompleted,
  CollectedSignatures,
  HomeAMB,
  SignedForAffirmation,
  SignedForUserRequest,
  UserRequestForSignature,
} from "../generated/HomeAMB/HomeAMB";
import {
  AMBTransaction,
  TransactionExecution,
  TransactionValidation,
  Validator,
} from "../generated/schema";

import {
  mockAMBValidators,
  AMB_telepathyAddress,
} from "./utils/mock-validators";
import {
  isAffirmationFromOmnibridge,
  isOmniBridgeKnownMediator,
  isOmniBridgeUsage,
  getMessageIdFromTelepathySingedAffirmation,
  processOmniBridgeTokenBridgingInitiatedEvent,
  processOmniBridgeTokensBridged,
} from "./utils/omni-bridge";

const MAINNET_OMNI_BRIDGE_HOME_MEDIATOR = "88ad09518695c6c3712AC10a214bE5109a655671".toLowerCase();

//-------------------------
// Home > Foreign
// When operation is initiated in home > Signature events are called
//-------------------------

// 1. The user initiates a bridging by transferring funds to the omnibridge mediator.
export function handlerUserRequestForSignature(
  event: UserRequestForSignature
): void {
  const transactionHash = event.transaction.hash;
  const messageId = event.params.messageId;
  const message = event.params.encodedData.toHexString();
  const receipt = event.receipt;

  // filter transactions by home and foreign mediator addresses within encodedData param
  if (!isOmniBridgeUsage(message)) {
    return;
  }

  if (!receipt) {
    log.error(
      "handlerUserRequestForAffirmation: No receipt found for transaction {}",
      [transactionHash.toHexString()]
    );
    return;
  }

  let transaction = new AMBTransaction(messageId.toHexString());
  transaction.messageId = messageId;
  transaction.transactionHash = transactionHash;
  transaction.timestamp = event.block.timestamp;
  transaction.bridgeName = "AMB";
  transaction.transactionStatus = "INITIATED";

  transaction.initiatorNetwork = dataSource.network();
  processOmniBridgeTokenBridgingInitiatedEvent(transaction, receipt, messageId);

  transaction.receiver = Bytes.fromHexString(message.slice(260, 300));
  transaction.receiverAmount = transaction.initiatorAmount;
  transaction.receiverToken = transaction.initiatorToken;
  // detect the other side using the OmniBridgeHomeMediator address.
  transaction.receiverNetwork = message
    .toLowerCase()
    .includes(MAINNET_OMNI_BRIDGE_HOME_MEDIATOR)
    ? "mainnet"
    : "unknown";
  transaction.save();
}

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
  const messageId = message.slice(0, 66);
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
  mockAMBValidators();
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
  txValidation.validatorAddr = validator.address;
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
  const messageId = message.slice(0, 66);
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
  mockAMBValidators();
  const validator = Validator.load(executorId.toHexString());
  if (!validator) {
    log.error(
      `handlerCollectedSignatures: Validator {} NOT FOUND - txHash: {}`,
      [executorId.toHexString(), event.transaction.hash.toHexString()]
    );
    return;
  }

  // Execution
  const executionId = messageId + "-" + executorId.toHexString();
  const execution = new TransactionExecution(executionId);
  execution.executor = validator.id;
  execution.validatorAddr = validator.address;
  execution.transaction = messageId;
  execution.transactionHash = event.transaction.hash;
  execution.timestamp = timestamp;
  execution.save();
}

//-------------------------
// Foreign > Home
// When operation is initiated in foreign > Affirmation events are collected
//-------------------------

// 1. A user initiated a bridge from Foreign to Home.
// >> Foreign

// 2. SignedForAffirmation.
// This is the first event the home is aware of.
// It is triggered when a validator signs an affirmation (saying the operation is valid).
export function handlerSignedForAffirmation(event: SignedForAffirmation): void {
  const transactionData = event.transaction.input.toHexString();

  // There are some operations that are not for an ERC20 bridge.
  // We need to filter them out as they are out of scope.
  if (!isAffirmationFromOmnibridge(transactionData)) {
    return;
  }

  const transactionHash = event.transaction.hash;
  const timestamp = event.block.timestamp;
  const signer = event.params.signer;
  const signerString = signer.toHexString();

  // if signer is Telepathy, txData has to be processed with different indexes
  const messageId =
    signerString == AMB_telepathyAddress
      ? getMessageIdFromTelepathySingedAffirmation(event.receipt)
      : `0x${transactionData.slice(138, 202)}`;

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
    // transaction.timestamp = timestamp;
    transaction.bridgeName = "AMB";
    transaction.initiatorNetwork = "mainnet";
    transaction.receiverNetwork = dataSource.network();
    transaction.transactionStatus = "COLLECTING";
    transaction.save();
  }

  // load validator
  mockAMBValidators();
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
  txValidation.validatorAddr = validator.address;
  txValidation.transactionHash = transactionHash;
  txValidation.transaction = messageId;
  txValidation.timestamp = timestamp;
  txValidation.save();

  // update validator
  validator.lastActivity = timestamp;
  validator.save();
}

// 3. AffirmationCompleted.
// This event is triggered when after threshold of validators signatures is reached.
// and the funds are minted on home side.
// NOTE: We are getting receiver information by parsing the event TokensBridged from the OmnibridgeMediator.
// We create the execution and assign it to the tx.
// AffirmationCompleted (index_topic_1 address sender, index_topic_2 address executor, index_topic_3 bytes32 messageId, bool status)
export function handlerAffirmationCompleted(event: AffirmationCompleted): void {
  const transactionHash = event.transaction.hash;
  const sender = event.params.sender.toHexString(); // foreignMediator
  const executor = event.params.executor.toHexString(); // homeMediator
  const timestamp = event.block.timestamp;
  const messageId = event.params.messageId.toHexString();
  const receipt = event.receipt;

  // There are some operations that are not for an ERC20 bridge.
  // We need to filter them out as they are out of scope.
  if (!isOmniBridgeKnownMediator(executor, sender)) {
    return;
  }

  if (!receipt) {
    log.error(
      "handlerAffirmationCompleted: No receipt found for transaction {}",
      [transactionHash.toHexString()]
    );
    return;
  }

  // create execution
  const executionId = messageId + "-" + executor;
  const execution = new TransactionExecution(executionId);
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
    execution.executor = validation.validator;
    execution.validatorAddr = validation.validatorAddr;
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
  transaction.transactionStatus = "COMPLETED";
  transaction.execution = execution.id;
  processOmniBridgeTokensBridged(transaction, receipt);
  transaction.save();
}
