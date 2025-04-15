import { Address, Bytes, dataSource, log } from "@graphprotocol/graph-ts";
import { RelayedMessage } from "../generated/ForeignBridgeErcToNative/ForeignBridgeErcToNative";
import { XDAITransaction, TransactionExecution } from "../generated/schema";
import { Transfer } from "../generated/DAI/DAI";
import { FOREIGN_BRIDGE_ERC_TO_NATIVE_ADDRESS } from "./config/addresses";
// import { processUserRequestForAffirmation } from "./utils/xdai-bridge";
import { DAI_ADDRESS, isSameString } from "./utils/misc";
import { combineNonceAndChainId, USER_REQUEST_FOR_AFFIRMATION_TOPIC, USER_REQUEST_FOR_AFFIRMATION_TOPIC_WITH_NONCE } from "./utils/xdai-bridge";

//-------------------------
// Foreign > Home
//-------------------------

// The bridging operation is initiated in foreign and can be started in two different ways:
// 1. A user transfers DAI directly to the bridge contract
// 2. The user transfer DAI to the bridge contract via the OmniBridge
// For 1. the event UserRequestForAffirmation is not emitted.
export function handlerTransfer(event: Transfer): void {
  const txHash = event.transaction.hash;
  const value = event.params.wad;
  const sender = event.params.src;
  const recipient = event.params.dst;
  const receipt = event.receipt;

  // discard events not related to the bridge
  if (
    !isSameString(FOREIGN_BRIDGE_ERC_TO_NATIVE_ADDRESS, recipient.toHexString())
  ) {
    return;
  }

  // discard transfers from 0x
  if (sender == Address.zero()) {
    return;
  }

  // Determine the transaction ID based on the logs
  let transactionId = txHash.toHexString();
  let messageId = Bytes.empty();
  let hasMessageId = false;

  let receiver = Address.zero();
  let hasReceiver = false;

  if (receipt != null) {
    // Check for logs with USER_REQUEST_FOR_AFFIRMATION_TOPIC_WITH_NONCE
    const logsWithNonce = receipt.logs.filter((_log) =>
      _log.topics.includes(USER_REQUEST_FOR_AFFIRMATION_TOPIC_WITH_NONCE)
    );

    // Check for logs with USER_REQUEST_FOR_AFFIRMATION_TOPIC
    const logsWithoutNonce = receipt.logs.filter((_log) =>
      _log.topics.includes(USER_REQUEST_FOR_AFFIRMATION_TOPIC)
    );

    // If we have logs with nonce, use the nonce as the transaction ID
    if (logsWithNonce.length > 0) {
      const _affirmationEvent = logsWithNonce[0];
      // Extract nonce from the event data
      const nonce = Bytes.fromHexString(`0x${_affirmationEvent.data.toHexString().slice(2, 66)}`);
      const nonceAndChainId = combineNonceAndChainId(nonce, 1);
      transactionId = nonceAndChainId.toHexString(); 
      messageId = nonceAndChainId;
      hasMessageId = true;
      receiver = Address.fromBytes(Bytes.fromHexString(
        `0x${_affirmationEvent.data.toHexString().slice(66, 106)}`
      ));
      hasReceiver = true;
    } 
    // If we have logs without nonce, use the transaction hash as the ID
    else if (logsWithoutNonce.length > 0) {
      const _affirmationEvent = logsWithoutNonce[0];
      receiver = Address.fromBytes(Bytes.fromHexString(
        `0x${_affirmationEvent.data.toHexString().slice(26, 66)}`
      ));
    }
  }

  // Create the transaction with the determined ID
  let transaction = new XDAITransaction(transactionId);
  transaction.transactionHash = txHash;
  transaction.bridgeName = "XDAI";
  transaction.transactionStatus = "INITIATED";
  transaction.timestamp = event.block.timestamp;

  transaction.initiator = sender;
  transaction.initiatorToken = Address.fromHexString(DAI_ADDRESS);
  transaction.initiatorAmount = value;
  transaction.initiatorNetwork = dataSource.network();

  // Set the receiver if it was determined from the logs
  if (hasReceiver) {
    transaction.receiver = receiver;
  } else {
    // If no receiver was determined, assume it's the same as the sender
    transaction.receiver = sender;
  }

  // Set the messageId if it was determined from the logs
  if (hasMessageId) {
    transaction.messageId = messageId;
  }

  transaction.receiverAmount = value;
  transaction.receiverNetwork = "gnosis";
  transaction.receiverToken = Address.zero();

  transaction.save();
}

//-------------------------
// Home > Foreign
//-------------------------
// This event is triggered when the user receives the funds on the foreign chain.
// Note that the bridging operation was initiated in home.
export function handlerRelayedMessage(event: RelayedMessage): void {
  const txHash = event.params.transactionHash.toHexString();
  const timestamp = event.block.timestamp;

  let execution = new TransactionExecution(txHash);
  execution.transaction = txHash;
  execution.transactionHash = event.transaction.hash;
  execution.timestamp = timestamp;
  execution.save();

  let transaction = new XDAITransaction(txHash);
  transaction.transactionHash = event.params.transactionHash;
  transaction.bridgeName = "XDAI";
  transaction.transactionStatus = "COMPLETED";

  transaction.initiatorNetwork = "gnosis";
  transaction.initiatorToken = Address.zero();
  transaction.initiatorAmount = event.params.value;

  transaction.receiver = event.params.recipient;
  transaction.receiverToken = Address.fromHexString(DAI_ADDRESS);
  transaction.receiverNetwork = dataSource.network();
  transaction.receiverAmount = event.params.value;

  transaction.execution = execution.id;
  transaction.save();
}
