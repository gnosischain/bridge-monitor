import { Address, Bytes, ethereum, log } from "@graphprotocol/graph-ts";
import { XDAITransaction } from "../../generated/schema";
import { DAI_ADDRESS, bytesToBigInt, strip0x } from "./misc";

const USER_REQUEST_FOR_AFFIRMATION_TOPIC = Bytes.fromHexString(
  "0x1d491a427d1f8cc0d447496f300fac39f7306122481d8e663451eb268274146b"
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

export function getHomeTxHashFromMessageMethod(_message: Bytes): string {
  const message = strip0x(_message.toHexString());
  return `0x${message.slice(104, 168)}`;
}
