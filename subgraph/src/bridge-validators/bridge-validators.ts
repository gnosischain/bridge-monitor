import { Bytes, log } from "@graphprotocol/graph-ts";
import { Validator } from "../../generated/schema";
import { VALIDATORS_CONFIG } from "../config/validators";

export function _handlerValidatorAdded(
  validatorAddress: Bytes,
  txHash: string,
  bridgeType: string
): void {
  const address = validatorAddress.toHexString();
  const config = VALIDATORS_CONFIG.get(address);

  const id = `${address}-${bridgeType}`;
  let validator = new Validator(id);
  validator.address = validatorAddress;
  validator.name = config ? config.get("name") : "unknown";
  validator.bridgeType = bridgeType;
  validator.removed = false;
  validator.hashAdded = txHash;
  validator.save();
}

export function _handlerValidatorRemoved(
  validatorAddress: Bytes,
  txHash: string,
  bridgeType: string
): void {
  const id = `${validatorAddress.toHexString()}-${bridgeType}`;
  const validator = Validator.load(id);

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
