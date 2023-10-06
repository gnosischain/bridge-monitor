import { Bytes, dataSource, log } from "@graphprotocol/graph-ts";
import {
  RelayedMessage,
  UserRequestForAffirmation,
} from "../generated/ForeignAMB/ForeignAMB";
import { AMBTransaction, TransactionExecution } from "../generated/schema";

import {
  isOmniBridgeKnownMediator,
  isOmniBridgeUsage,
  processOmniBridgeTokenBridgingInitiatedEvent,
  processOmniBridgeTokensBridged,
} from "./utils/omni-bridge";

//-------------------------
// Foreign > Home
//-------------------------
// The user initiates a bridging by transferring funds to the omnibridge mediator.
export function handlerUserRequestForAffirmation(
  event: UserRequestForAffirmation
): void {
  const transactionHash = event.transaction.hash;
  const timestamp = event.block.timestamp;
  const messageId = event.params.messageId;
  const message = event.params.encodedData.toHexString();
  const network = dataSource.network();
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
  transaction.timestamp = timestamp;
  transaction.bridgeName = "AMB";
  transaction.transactionStatus = "INITIATED";

  transaction.initiatorNetwork = network;
  processOmniBridgeTokenBridgingInitiatedEvent(transaction, receipt);

  transaction.receiver = Bytes.fromHexString(message.slice(258, 298));
  transaction.receiverAmount = transaction.initiatorAmount;
  transaction.receiverToken = transaction.initiatorToken;
  transaction.receiverNetwork = "gnosis";
  transaction.save();
}

//-------------------------
// Home > Foreign
//-------------------------
// Continuation from home-amb
// 1. The user transfer tokens to the AMB (home side)
// 1. The validators sign the bridging operation (home side)
// 3. When the threshold of signatures is reached, anyone can take the signatures and complete the bridging operation (This handler)
// Note: As the transaction originated on home side, the Transaction entity does't exist yet on this side.
export function handlerRelayedMessage(event: RelayedMessage): void {
  const transactionHash = event.transaction.hash;
  const timestamp = event.block.timestamp;
  const messageId = event.params.messageId;
  const messageIdString = messageId.toHexString();
  const sender = event.params.sender; // home mediator address
  const executor = event.params.executor; // foreign mediator address
  const status = event.params.status;
  const receipt = event.receipt;

  if (
    !isOmniBridgeKnownMediator(sender.toHexString(), executor.toHexString())
  ) {
    return;
  }

  if (!receipt) {
    log.error("handlerRelayedMessage: No receipt found for transaction {}", [
      transactionHash.toHexString(),
    ]);
    return;
  }

  // create transaction execution
  const transactionExecutionId = messageIdString + "-" + sender.toHexString(); // sender is homeMediator !!
  const execution = new TransactionExecution(transactionExecutionId);
  execution.transaction = messageIdString; // transaction.id
  execution.transactionHash = transactionHash;
  execution.timestamp = timestamp;
  execution.save();

  // update transaction
  const transaction = new AMBTransaction(messageIdString);
  transaction.bridgeName = "AMB";
  transaction.messageId = messageId;
  transaction.execution = execution.id;
  transaction.transactionStatus = status ? "COMPLETED" : "ERROR";
  transaction.initiatorNetwork = "gnosis";
  transaction.receiverNetwork = dataSource.network();
  processOmniBridgeTokensBridged(transaction, receipt);
  transaction.save();
}
