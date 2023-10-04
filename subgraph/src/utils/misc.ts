import { BigInt, Bytes } from "@graphprotocol/graph-ts";

export function isSameString(a: string, b: string): boolean {
  return a.toLowerCase() == b.toLowerCase();
}

export function bytesToBigInt(value: Bytes): BigInt {
  return BigInt.fromUnsignedBytes(Bytes.fromUint8Array(value.reverse()));
}
