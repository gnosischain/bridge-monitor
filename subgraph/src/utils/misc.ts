import { BigInt, Bytes } from "@graphprotocol/graph-ts";
import { Validator } from "../../generated/schema";
import { mockAMBValidators, mockXDAIValidators } from "./mock-validators";

export const DAI_ADDRESS = "0x6B175474E89094C44Da98b954EedeAC495271d0F";

export const BRIDGE_AMB = "AMB";
export const BRIDGE_XDAI = "XDAI";

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

export function loadValidator(
  address: string,
  bridgeType: string
): Validator | null {
  // if (bridgeType == BRIDGE_AMB) {
  //   mockAMBValidators();
  // }

  // if (bridgeType == BRIDGE_XDAI) {
  //   mockXDAIValidators();
  // }

  return Validator.load(`${address}-${bridgeType}`);
}
