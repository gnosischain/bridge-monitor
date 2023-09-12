import { BigInt, Bytes, log, store } from "@graphprotocol/graph-ts";
import { Validator } from "../../generated/schema";
import { VALIDATORS_CONFIG } from "../config/validators";

export function _handlerValidatorAdded(
  validatorAddress: Bytes,
  txHash: string
): void {
  const id = validatorAddress.toHexString();
  let validator = new Validator(id);
  validator.address = validatorAddress;
  validator.name = "Unknown";

  const config = VALIDATORS_CONFIG.get(id.toLowerCase());
  if (config) {
    validator.name = config.get("name");
    validator.bridgeType = config.get("bridgeType");
  }
  validator.removed = false;
  validator.hashAdded = txHash;
  validator.save();
}

export function _handlerValidatorRemoved(
  validatorAddress: Bytes,
  txHash: string
): void {
  const id = validatorAddress.toHexString();
  let validator = Validator.load(id);

  if (!validator) {
    log.error(
      `_handlerValidatorRemoved: There was not possible to remove validator with ID: {} NOT FOUND - hash: {}`,
      [id, txHash]
    );
    return;
  }

  validator.removed = true;
  validator.hashRemoved = txHash;
  validator.save();
}
