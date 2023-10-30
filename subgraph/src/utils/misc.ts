import { BigInt, Bytes } from "@graphprotocol/graph-ts";

export const DAI_ADDRESS = "0x6B175474E89094C44Da98b954EedeAC495271d0F";

export function isSameString(a: string, b: string): boolean {
  return a.toLowerCase() == b.toLowerCase();
}

// This helpers converts a bytes number to a BigInt.
export function bytesToBigInt(value: Bytes): BigInt {
  return BigInt.fromUnsignedBytes(Bytes.fromUint8Array(value.reverse()));
}

export function hexToIntString(amount: string): string {
  return parseInt(amount, 16).toString();
}

export function strip0x(input: string): string {
  return input.replace("0x", "");
}
