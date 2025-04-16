import { Address, Bytes, ethereum, log } from "@graphprotocol/graph-ts";
import { XDAITransaction } from "../../generated/schema";
import { DAI_ADDRESS, bytesToBigInt, strip0x } from "./misc";

export const USER_REQUEST_FOR_AFFIRMATION_TOPIC = Bytes.fromHexString(
  "0x1d491a427d1f8cc0d447496f300fac39f7306122481d8e663451eb268274146b"
);

export const USER_REQUEST_FOR_AFFIRMATION_TOPIC_WITH_NONCE = Bytes.fromHexString(
  "0xf6968e689b3d8c24f22c10c2a3256bb5ca483a474e11bac08423baa049e38ae8"
);

export function processUserRequestForAffirmation(
  transaction: XDAITransaction,
  receipt: ethereum.TransactionReceipt | null
): void {
  // We need to extract the receiver address from this event.
  // We've opt to process the event this way to simplify the understanding of the bridging process.
  // Another alternative could have been to consume the event UserRequestForAffirmation.

  if (receipt == null) {
    return;
  }

  const filteredLogs = receipt.logs.filter((_log) =>
    _log.topics.includes(USER_REQUEST_FOR_AFFIRMATION_TOPIC)
  );

  if (filteredLogs.length > 0) {
    const _affirmationEvent = filteredLogs[0];
    transaction.receiver = Address.fromHexString(
      `0x${_affirmationEvent.data.toHexString().slice(26, 66)}`
    );
  }
}

export function xDAISignedForAffirmationData(
  transaction: XDAITransaction,
  _message: string
): void {
  // save receiver amount
  const amount = Bytes.fromHexString(`0x${_message.slice(74, 138)}`);

  // save receiver
  transaction.receiver = Address.fromHexString(`0x${_message.slice(34, 74)}`);
  transaction.receiverAmount = bytesToBigInt(amount);
  transaction.receiverToken = Address.zero();

  transaction.initiatorAmount = bytesToBigInt(amount);
  transaction.initiatorToken = Address.fromHexString(DAI_ADDRESS);
}

export function getHomeNonceOrTxHashFromMessageMethod(_message: Bytes): string {
  const message = strip0x(_message.toHexString());
  return `0x${message.slice(104, 168)}`;
}

// nonce: Bytes (length 32), chainId: number
export function combineNonceAndChainId(nonce: Bytes, chainId: i32): Bytes {
  // Convert chainId to 4 bytes (big-endian)
  let chainIdBytes = new Uint8Array(4);
  chainIdBytes[0] = (chainId >> 24) as u8;
  chainIdBytes[1] = (chainId >> 16) as u8;
  chainIdBytes[2] = (chainId >> 8) as u8;
  chainIdBytes[3] = (chainId) as u8;

  // Take the last 28 bytes of the nonce
  let nonceBytes = nonce.subarray(4, 32);

  // Concatenate
  let result = new Uint8Array(32);
  for (let i = 0; i < 4; i++) {
    result[i] = chainIdBytes[i];
  }
  for (let i = 0; i < 28; i++) {
    result[4 + i] = nonceBytes[i];
  }
  return Bytes.fromUint8Array(result);
}

