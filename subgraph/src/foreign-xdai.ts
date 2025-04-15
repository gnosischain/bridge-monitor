import { Address, BigInt, Bytes, dataSource, log } from "@graphprotocol/graph-ts";
import { RelayedMessage, UserRequestForAffirmation } from "../generated/ForeignBridgeErcToNative/ForeignBridgeErcToNative";
import { XDAITransaction, TransactionExecution } from "../generated/schema";
import { Transfer } from "../generated/DAI/DAI";
import { FOREIGN_BRIDGE_ERC_TO_NATIVE_ADDRESS } from "./config/addresses";
// import { processUserRequestForAffirmation } from "./utils/xdai-bridge";
import { DAI_ADDRESS, isSameString } from "./utils/misc";
import { combineNonceAndChainId, processUserRequestForAffirmation, USER_REQUEST_FOR_AFFIRMATION_TOPIC, USER_REQUEST_FOR_AFFIRMATION_TOPIC_WITH_NONCE } from "./utils/xdai-bridge";

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

  // discard events after bridge updated to use nonce
  if (event.block.number >= new BigInt(22273407)) {
    return;
  }

  let transaction = new XDAITransaction(txHash.toHexString());
  transaction.transactionHash = txHash;
  transaction.bridgeName = "XDAI";
  transaction.transactionStatus = "INITIATED";
  transaction.timestamp = event.block.timestamp;

  transaction.initiator = sender;
  transaction.initiatorToken = Address.fromHexString(DAI_ADDRESS);
  transaction.initiatorAmount = value;
  transaction.initiatorNetwork = dataSource.network();

  processUserRequestForAffirmation(transaction, receipt);
  // if processUserRequestForAffirmation hasn't set receiver address
  // we can be sure it was a transfer directly to the xDAI bridge contract
  // when that happens, userRequestForAffirmation event is not emitted
  // for this case, we can assume the receiver is the same as the sender
  // here are examples of both cases:
  // https://etherscan.io/tx/0x1445acd5d72025e5cf824edbb3d036e1e8adf5340acbe9940551a095ae8af575#eventlog
  // https://etherscan.io/tx/0xc718b857fa518056264d7fab70d3a6eb8634fd76eb3d54e60c5a1ff873f1b0a4#eventlog
  if (!transaction.receiver) {
    transaction.receiver = sender;
  }
  transaction.receiverAmount = value;
  transaction.receiverNetwork = "gnosis";
  transaction.receiverToken = Address.zero();

  transaction.save();
}

const TRANSFER_TOPIC = Bytes.fromHexString("0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef"); // keccak256("Transfer(address,address,uint256)")

export function handlerUserRequestForAffirmationWithNonce(event: UserRequestForAffirmation): void {
  const txHash = event.transaction.hash;
  let sender = Address.zero();
  const value = event.params.value;
  const nonce = event.params.nonce;
  const recipient = event.params.recipient;

  // discard events after bridge updated to use nonce
  if (event.block.number < new BigInt(22273407)) {
    return;
  }

  const nonceWithChainId = combineNonceAndChainId(nonce, 1);

  let receipt = event.receipt;
  if (receipt != null) {
    for (let i = 0; i < receipt.logs.length; i++) {
      let log = receipt.logs[i];
      if (log.topics.length > 0 && log.topics[0].equals(TRANSFER_TOPIC)) {
        // topics[1] is the 'src' (sender) address, as a Bytes32
        let srcBytes = log.topics[1];
        // Take the last 20 bytes for the address
        sender = Address.fromBytes(Bytes.fromUint8Array(srcBytes.subarray(12, 32)));
        break;
      }
    }
  }

  let transaction = new XDAITransaction(nonceWithChainId.toHexString());
  transaction.initiator = sender;
  transaction.initiatorToken = Address.fromHexString(DAI_ADDRESS);
  transaction.initiatorAmount = value;
  transaction.initiatorNetwork = "mainnet";

  transaction.messageId = nonceWithChainId;

  transaction.transactionHash = txHash;
  transaction.bridgeName = "XDAI";
  transaction.transactionStatus = "INITIATED";
  transaction.timestamp = event.block.timestamp;
  transaction.receiver = recipient;
  transaction.receiverAmount = value;
  transaction.receiverNetwork = "gnosis";
  transaction.receiverToken = Address.zero();
  transaction.nonce = nonce;
  transaction.save();
}

//-------------------------
// Home > Foreign
//-------------------------
// This event is triggered when the user receives the funds on the foreign chain.
// Note that the bridging operation was initiated in home.
export function handlerRelayedMessage(event: RelayedMessage): void {
  if (event.block.number < new BigInt(22273407)) {
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
  } else {
    const nonce = event.params.transactionHash;
    const timestamp = event.block.timestamp;

    const nonceWithChainId = combineNonceAndChainId(nonce, 100);
    const nonceWithChainIdHex = nonceWithChainId.toHexString();

    let execution = new TransactionExecution(nonceWithChainIdHex);
    execution.transaction = nonceWithChainIdHex;
    execution.transactionHash = event.transaction.hash;
    execution.timestamp = timestamp;
    execution.save();

    let transaction = new XDAITransaction(nonceWithChainIdHex);
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
}
