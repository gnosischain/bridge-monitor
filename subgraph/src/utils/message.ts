import { Address, BigInt, Bytes, ethereum, log } from "@graphprotocol/graph-ts";
import { AMBTransaction } from "../../generated/schema";
import { isSameString } from "./misc";

/**
 * @description This File is based on the parseMessage function from the https://github.com/omni/tokenbridge oracle repository
 */

const HOME_MEDIATOR = "F6A78083CA3E2A662D6DD1703C939C8ACE2E268D";
const MAINNET_MEDIATOR = "88AD09518695C6C3712AC10A214BE5109A655671";

function strip0x(input: string): string {
  return input.replace("0x", "");
}

export function parseMessage(message: string): Array<string> {
  message = strip0x(message);

  const recipientStart = 0;
  const recipientLength = 40;
  const recipient = `0x${message.slice(
    recipientStart,
    recipientStart + recipientLength
  )}`;

  const amountStart = recipientStart + recipientLength;
  const amountLength = 32 * 2;
  const parsedAmount = message.slice(amountStart, amountStart + amountLength);
  const intStringAmount = hexToIntString(parsedAmount);

  const txHashStart = amountStart + amountLength;
  const txHashLength = 32 * 2;
  const txHash = `0x${message.slice(txHashStart, txHashStart + txHashLength)}`;

  const contractAddressStart = txHashStart + txHashLength;
  const contractAddressLength = 40;
  const contractAddress = `0x${message.slice(
    contractAddressStart,
    contractAddressStart + contractAddressLength
  )}`;

  return [recipient, intStringAmount, txHash, contractAddress];
}

function hexToIntString(amount: string): string {
  return parseInt(amount, 16).toString();
}

export function parseTXInput(_input: string): string {
  return `0x${_input.slice(138, 202)}`;
}

export function parseAMBMessageHash(_message: string): string {
  // well known data content from messageHash: messageId
  return `${_message.slice(0, 66)}`;
}

// MessageId
export function parseAMBTransactionInput(_input: string): string {
  return `0x${_input.slice(138, 202)}`;
}

export function parseAMBTransactionInputForTelepathy(
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

// Check if the tx is to bridge ERC20 tokens.
export function isAffirmationFromOmnibridge(_input: string): boolean {
  // This was the old implementation, but it was not working for Telepathy validator.

  // const originMediator = `${_input.slice(202, 242)}`;
  // const destinationMediator = `${_input.slice(242, 282)}`;
  // return (
  //   (isSameString(originMediator, HOME_MEDIATOR) &&
  //     isSameString(destinationMediator, FOREIGN_MEDIATOR)) ||
  //   (isSameString(destinationMediator, HOME_MEDIATOR) &&
  //     isSameString(originMediator, FOREIGN_MEDIATOR))
  // );

  // For now checking if Foreign and Home mediator are present in the input is enough.
  return (
    _input.indexOf(HOME_MEDIATOR.toLowerCase()) > -1 &&
    _input.indexOf(MAINNET_MEDIATOR.toLowerCase()) > -1
  );
}

export function isFromOmniBridgeUsage(
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
