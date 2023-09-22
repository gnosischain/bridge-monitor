import { Address, BigInt, Bytes, ethereum } from "@graphprotocol/graph-ts";
import { AMBTransaction } from "../../generated/schema";

// capture TokensBridgingInitiated event
const TOKENS_BRIDGING_INITIATED_TOPIC = Bytes.fromHexString(
  "0x59a9a8027b9c87b961e254899821c9a276b5efc35d1f7409ea4f291470f1629a"
);

const TOKENS_BRIDGED_TOPIC = Bytes.fromHexString(
  "0x9afd47907e25028cdaca89d193518c302bbb128617d5a992c5abd45815526593"
);

export function processOmniBridgeTokenBridgingInitiatedEvent(
  transaction: AMBTransaction,
  receipt: ethereum.TransactionReceipt
): void {
  // We need to extract amount, token and the sender address from this event.
  // We've opt to process the event this way to simplify the understanding of the bridging process.
  // Another alternative could have been to parse this event declaring the omnibridge data-source and filling
  // the transaction entity parsing the events independently.

  const filtered = receipt.logs.filter((_log) => {
    const _topics = _log.topics;
    return _topics.includes(TOKENS_BRIDGING_INITIATED_TOPIC);
  });

  if (filtered.length > 0) {
    const _tokensBridgingEvent = filtered[0];

    // convert bytes to BigInt
    transaction.initiatorAmount = BigInt.fromUnsignedBytes(
      Bytes.fromUint8Array(_tokensBridgingEvent.data.reverse())
    );
    transaction.initiatorToken = Address.fromHexString(
      _tokensBridgingEvent.topics[1].toHexString().slice(26, 66)
    );
    transaction.initiator = Address.fromHexString(
      _tokensBridgingEvent.topics[2].toHexString().slice(26, 66)
    );

    transaction;
  }
}

export function processOmniBridgeTokensBridged(
  transaction: AMBTransaction,
  receipt: ethereum.TransactionReceipt
): void {
  // We need to extract amount, token and the recipient address from this event.
  // We've opt to process the event this way to simplify the understanding of the bridging process.
  // Another alternative could have been to parse this event declaring the omnibridge data-source and filling
  // the transaction entity parsing the events independently.

  const filtered = receipt.logs.filter((_log) => {
    const _topics = _log.topics;
    return _topics.includes(TOKENS_BRIDGED_TOPIC);
  });

  if (filtered.length > 0) {
    const _tokensBridgedEvent = filtered[0];

    transaction.receiverToken = Address.fromHexString(
      _tokensBridgedEvent.topics[1].toHexString().slice(26, 66)
    );

    transaction.receiver = Address.fromHexString(
      _tokensBridgedEvent.topics[2].toHexString().slice(26, 66)
    );

    transaction.receiverAmount = BigInt.fromUnsignedBytes(
      Bytes.fromUint8Array(_tokensBridgedEvent.data.reverse())
    );
  }
}
