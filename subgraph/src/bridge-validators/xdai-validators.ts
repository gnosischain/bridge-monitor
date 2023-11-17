import {
  ValidatorAdded,
  ValidatorRemoved,
} from "../../generated/XDAIBridgeValidators/BridgeValidators";
import { BRIDGE_XDAI } from "../utils/misc";
import {
  _handlerValidatorAdded,
  _handlerValidatorRemoved,
} from "./bridge-validators";

export function handlerValidatorAdded(event: ValidatorAdded): void {
  const validatorAddress = event.params.validator;
  _handlerValidatorAdded(
    validatorAddress,
    event.transaction.hash.toHexString(),
    BRIDGE_XDAI
  );
}

export function handlerValidatorRemoved(event: ValidatorRemoved): void {
  const validatorAddress = event.params.validator;
  _handlerValidatorRemoved(
    validatorAddress,
    event.transaction.hash.toHexString(),
    BRIDGE_XDAI
  );
}
