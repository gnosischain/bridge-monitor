import { Address, dataSource, log } from "@graphprotocol/graph-ts";
import {
  RelayedMessage,
  UserRequestForAffirmation,
} from "../generated/ForeignAMB/ForeignAMB";
import {
  AMBTransaction,
  TransactionExecution,
  Validator,
} from "../generated/schema";
import {
  isOmniBridgeUsage,
  isFromOmniBridgeUsage,
  parseAMBEncodedData,
} from "./message";

//-------------------------
// Foreign > Home
//-------------------------
// When the user initiates a bridging on the foreign side.
// We will create the transaction here.
// It won't be updated never again, as the whole process is done on the home side.
export function handlerUserRequestForAffirmation(
  event: UserRequestForAffirmation
): void {
  // UserRequestForSignature (index_topic_1 bytes32 messageId, bytes encodedData)
  const transactionHash = event.transaction.hash;
  const timestamp = event.block.timestamp;
  const messageId = event.params.messageId;
  const message = event.params.encodedData.toHexString();
  const network = dataSource.network();

  // filter transactions by home and foreign mediator addresses within encodedData param
  if (!isOmniBridgeUsage(message)) {
    return;
  }

  const messageContent = parseAMBEncodedData(message);
  let transaction = new AMBTransaction(messageId.toHexString());
  transaction.transactionHash = transactionHash;
  transaction.timestamp = timestamp;
  transaction.bridgeName = "AMB";
  transaction.messageId = messageId;
  transaction.initiatorNetwork = network;
  transaction.receiver = Address.fromHexString(messageContent[2]);
  transaction.receiverToken = Address.fromHexString(messageContent[1]);
  transaction.transactionStatus = "INITIATED";
  transaction.save();
}

//-------------------------
// Home > Foreign
//-------------------------
// When the user claims their funds on the foreign side.
// The initiation and the collecting of signatures are done on the home side.
// So the TX does't exist on this side, we will created it here.
export function handlerRelayedMessage(event: RelayedMessage): void {
  const transactionHash = event.transaction.hash;
  const timestamp = event.block.timestamp;
  const messageId = event.params.messageId;
  const messageIdString = messageId.toHexString();
  const sender = event.params.sender; // home mediator address
  const executor = event.params.executor; // foreign mediator address
  const senderString = sender.toHexString();
  const status = event.params.status;

  if (!isFromOmniBridgeUsage(senderString, executor.toHexString())) {
    return;
  }

  // load and update validator
  const validator = Validator.load(senderString);
  if (!validator) {
    log.error(`handlerRelayedMessage: Validator {} NOT FOUND - txHash: {}`, [
      senderString,
      transactionHash.toHexString(),
    ]);
    return;
  }
  validator.lastActivity = event.block.timestamp;
  validator.save();

  // create transaction execution
  const transactionExecutionId = messageIdString + "-" + senderString; // sender is homeMediator !!
  const execution = new TransactionExecution(transactionExecutionId);
  execution.executor = validator.id;
  execution.responsableAddress = sender;
  execution.transaction = messageIdString; // transaction.id
  execution.transactionHash = transactionHash;
  execution.timestamp = timestamp;
  execution.save();

  // update transaction
  const transaction = new AMBTransaction(messageIdString);
  transaction.bridgeName = "AMB";
  transaction.messageId = messageId;
  transaction.execution = execution.id;
  transaction.transactionStatus = status ? "CLAIMED" : "ERROR";
  transaction.receiverNetwork = dataSource.network();
  transaction.save();
}
