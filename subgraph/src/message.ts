import { isSameString } from "./utils";

/**
 * @description This File is based on the parseMessage function from the https://github.com/omni/tokenbridge oracle repository
 */

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

// encodedData parsing logic extracted from tokenbridge/commons/message.js
// @todo should return an object: manualLane: (dataType && 128) === 128
const decodeAMBDataType = (dataType: number): boolean => {
  return (dataType && 128) === 128;
};

export function parseAMBEncodedData(_message: string): Array<string> {
  // well known data content from encodedData
  const messageId = `0x${_message.slice(0, 64)}`;
  const token = `0x${_message.slice(196, 236)}`;
  const senderReceiver = `0x${_message.slice(260, 300)}`;

  return [messageId, token, senderReceiver];
}

export function parseAMBMessageHash(_message: string): string {
  // well known data content from messageHash: messageId
  return `${_message.slice(0, 66)}`;
}

// MessageId
export function parseAMBTransactionInput(_input: string): string {
  return `0x${_input.slice(138, 202)}`;
}

export function getReceiver(_input: string): string {
  // well known data content from messageHash:
  // - receiver: chars 266 to 306
  const receiver = `0x${_input.slice(266, 306)}`;

  return receiver;
}

export function getInitiator(_input: string): string {
  // well known data content from messageHash:
  // - receiver: chars 396 to 436
  return `0x${_input.slice(396, 436)}`;
}

const HOME_MEDIATOR = "F6A78083CA3E2A662D6DD1703C939C8ACE2E268D";
const FOREIGN_MEDIATOR = "88AD09518695C6C3712AC10A214BE5109A655671";

// Check if the tx is to bridge ERC20 tokens.
export function isOmniBridgeUsage(_message: string): boolean {
  const originMediator = _message.slice(66, 106);
  const destinationMediator = _message.slice(106, 146);
  return (
    (isSameString(originMediator, HOME_MEDIATOR) &&
      isSameString(destinationMediator, FOREIGN_MEDIATOR)) ||
    (isSameString(destinationMediator, HOME_MEDIATOR) &&
      isSameString(originMediator, FOREIGN_MEDIATOR))
  );
}

// Check if the tx is to bridge ERC20 tokens.
export function isAffirmationFromOmnibridge(_input: string): boolean {
  const originMediator = `${_input.slice(202, 242)}`;
  const destinationMediator = `${_input.slice(242, 282)}`;
  return (
    (isSameString(originMediator, HOME_MEDIATOR) &&
      isSameString(destinationMediator, FOREIGN_MEDIATOR)) ||
    (isSameString(destinationMediator, HOME_MEDIATOR) &&
      isSameString(originMediator, FOREIGN_MEDIATOR))
  );
}

export function isFromOmniBridgeUsage(
  sender: string,
  executor: string
): boolean {
  return (
    isSameString(sender, FOREIGN_MEDIATOR) &&
    isSameString(executor, HOME_MEDIATOR)
  );
}

// TODO: unify with isFromOmniBridgeUsage
export function isFromOmniBridgeUsageNew(
  sender: string,
  executor: string
): boolean {
  return (
    isSameString(sender, `0x${FOREIGN_MEDIATOR}`) &&
    isSameString(executor, `0x${HOME_MEDIATOR}`)
  );
}
