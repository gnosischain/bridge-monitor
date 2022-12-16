/**
 * @description This File is based on the parseMessage function from the https://github.com/omni/tokenbridge oracle repository
 */

function strip0x(input: string): string {
  return input.replace('0x', '')
}

export function parseMessage(message: string): Array<string> {
  message = strip0x(message)

  const recipientStart = 0
  const recipientLength = 40
  const recipient = `0x${message.slice(recipientStart, recipientStart + recipientLength)}`

  const amountStart = recipientStart + recipientLength
  const amountLength = 32 * 2
  const amount = `0x${message.slice(amountStart, amountStart + amountLength)}`

  const txHashStart = amountStart + amountLength
  const txHashLength = 32 * 2
  const txHash = `0x${message.slice(txHashStart, txHashStart + txHashLength)}`

  const contractAddressStart = txHashStart + txHashLength
  const contractAddressLength = 32 * 2
  const contractAddress = `0x${message.slice(contractAddressStart, contractAddressStart + contractAddressLength)}`

  return [recipient, amount, txHash, contractAddress]
}

// encodedData parsing logic extracted from tokenbridge/commons/message.js
// @todo should return an object: manualLane: (dataType && 128) === 128
const decodeAMBDataType = (dataType: number): boolean => {
  return (dataType && 128) === 128
}

export function parseAMBMessage(_message: string): Array<string> {
  const message = strip0x(_message)

  const messageId = `0x${message.slice(0, 64)}`
  const sender = `0x${message.slice(64, 104)}`
  const executor = `0x${message.slice(104, 144)}`
  // const dataType = parseInt(message.slice(156, 158), 16)
  // const decodedDataType = decodeAMBDataType(dataType) // should transform dataType into bool
  const dataType = message.slice(156, 158) // should be int
  const decodedDataType = "false"
  return [messageId, sender, executor, dataType, decodedDataType]
}
