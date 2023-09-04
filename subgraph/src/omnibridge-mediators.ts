import { Bytes, dataSource, ethereum, log } from "@graphprotocol/graph-ts";
import {
  TokensBridgingInitiated,
  TokensBridged,
} from "../generated/OmniBridgeMediator/OmniBridgeMediators";
import { AMBTransaction } from "../generated/schema";

const _userRequestForSignatureTopicHash = Bytes.fromHexString(
  "0x520d2afde79cbd5db58755ac9480f81bc658e5c517fcae7365a3d832590b0183".toLowerCase()
);

function _getReceiverAddress(receipt: ethereum.TransactionReceipt): Bytes | null {
  const _userRequestForSignatureTopic = receipt.logs.filter((_log) => {
    const _topics = _log.topics;
    return _topics.includes(_userRequestForSignatureTopicHash);
  });

  
  if (_userRequestForSignatureTopic.length > 0) {
    const receiver = _userRequestForSignatureTopic[0].data
      .toHexString()
      .slice(388, 418);
    return Bytes.fromHexString(`0x${receiver}`) 
  }

  return null
}

//-------------------------
// Home > Foreign
// When operation is initiated in foreign > Affirmation events are called
//-------------------------
// This is the step 1.A The bridging operation starts when the user sends tokens to the omnibridge.
export function handlerTokensBridgingInitiated(
  event: TokensBridgingInitiated
): void {
  const messageId = event.params.messageId;

  const transaction = new AMBTransaction(messageId.toHexString());

  transaction.initiator = event.params.sender;
  transaction.initiatorToken = event.params.token;
  transaction.initiatorAmount = event.params.value;
  transaction.initiatorNetwork = dataSource.network();

  const receipt = event.receipt;
  if (receipt) {
    transaction.receiver = _getReceiverAddress(receipt);
  }
  transaction.receiverToken = event.params.token;
  transaction.receiverAmount = event.params.value;
  transaction.receiverNetwork = "mainnet";

  transaction.messageId = messageId;
  transaction.transactionHash = event.transaction.hash;
  transaction.timestamp = event.block.timestamp;
  transaction.bridgeName = "AMB";
  transaction.transactionStatus = "INITIATED";

  transaction.save();
}

//-------------------------
// Foreign > Home
// When operation is initiated in foreign > Affirmation events are called
//-------------------------

// This is the step 2.
// After the threshold of validators signatures is reached, funds are released and the tx is marked as completed.
export function handlerTokensBridged(event: TokensBridged): void {
  const messageId = event.params.messageId;
  const receiver = event.params.recipient;
  const token = event.params.token;
  const amount = event.params.value;

  const transaction = AMBTransaction.load(messageId.toHexString());
  if (!transaction) {
    log.error(`handlerTokensBridged: AMBTransaction {} NOT FOUND - hash: {}`, [
      messageId.toHexString(),
      event.transaction.hash.toHexString(),
    ]);
    return;
  }

  transaction.receiver = receiver;
  transaction.receiverToken = token;
  transaction.receiverAmount = amount;
  transaction.transactionStatus = "COMPLETED";
  transaction.save();
}
