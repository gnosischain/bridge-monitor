import { Address, BigInt, Bytes, ethereum } from "@graphprotocol/graph-ts";
import { AMBTransaction } from "../../generated/schema";
import { isSameString } from "./misc";

const HOME_MEDIATOR = "F6A78083CA3E2A662D6DD1703C939C8ACE2E268D";
const MAINNET_MEDIATOR = "88AD09518695C6C3712AC10A214BE5109A655671";
const TOKENS_BRIDGING_INITIATED_TOPIC = Bytes.fromHexString(
  "0x59a9a8027b9c87b961e254899821c9a276b5efc35d1f7409ea4f291470f1629a"
);
const TOKENS_BRIDGED_TOPIC = Bytes.fromHexString(
  "0x9afd47907e25028cdaca89d193518c302bbb128617d5a992c5abd45815526593"
);

// MessageId
export function parseAMBTransactionInput(_input: string): string {
  return `0x${_input.slice(138, 202)}`;
}

export function getMessageIdFromTelepathySingedAffirmation(
  receipt: ethereum.TransactionReceipt | null
): string {
  if (!receipt) return "";

  const _userRequestForSignatureTopic = receipt.logs.filter((_log) => {
    const _topics = _log.topics;
    return _topics.includes(
      Bytes.fromHexString(
        "0x720079e7f8eea356a67c3ee9cdde73af7e603734d051a9c2c1a986faed12c2fa"
      )
    );
  });

  if (_userRequestForSignatureTopic.length > 0) {
    return _userRequestForSignatureTopic[0].topics[2].toHexString();
  }

  return "";
}

// Check if the tx is to bridge ERC20 tokens.
export function isAffirmationFromOmnibridge(_input: string): boolean {
  // For now checking if Foreign and Home mediator are present in the input is enough.
  return (
    _input.indexOf(HOME_MEDIATOR.toLowerCase()) > -1 &&
    _input.indexOf(MAINNET_MEDIATOR.toLowerCase()) > -1
  );
}

// Check if the tx is to bridge ERC20 tokens.
export function isOmniBridgeUsage(_message: string): boolean {
  const originMediator = _message.slice(66, 106);
  const destinationMediator = _message.slice(106, 146);
  return (
    (isSameString(originMediator, HOME_MEDIATOR) &&
      isSameString(destinationMediator, MAINNET_MEDIATOR)) ||
    (isSameString(destinationMediator, HOME_MEDIATOR) &&
      isSameString(originMediator, MAINNET_MEDIATOR))
  );
}

export function isOmniBridgeKnownMediator(
  homeMediator: string,
  foreignMediator: string
): bool {
  const foreignMatches = [`0x${MAINNET_MEDIATOR}`.toLowerCase()].includes(
    foreignMediator.toLowerCase()
  );

  return (
    bool(isSameString(homeMediator, `0x${HOME_MEDIATOR}`)) && foreignMatches
  );
}

export function processOmniBridgeTokenBridgingInitiatedEvent(
  transaction: AMBTransaction,
  receipt: ethereum.TransactionReceipt,
  messageId: Bytes
): void {
  // We need to extract amount, token and the sender address from this event.
  // We've opt to process the event this way to simplify the understanding of the bridging process.
  // Another alternative could have been to parse this event declaring the omnibridge data-source and filling
  // the transaction entity parsing the events independently.

  let _tokensBridgingEvent: ethereum.Log | null = null;
  for (let index = 0; index < receipt.logs.length; index++) {
    const _log = receipt.logs[index];
    const _topics = _log.topics;
    if (
      _topics[0] == TOKENS_BRIDGING_INITIATED_TOPIC &&
      _topics[3] == messageId
    ) {
      _tokensBridgingEvent = _log;
      break;
    }
  }

  if (_tokensBridgingEvent) {
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
