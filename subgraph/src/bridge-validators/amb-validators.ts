import {
  ValidatorAdded,
  ValidatorRemoved,
} from "../../generated/AMBBridgeValidators/BridgeValidators";
import { BRIDGE_AMB } from "../utils/misc";
import {
  _handlerValidatorAdded,
  _handlerValidatorRemoved,
} from "./bridge-validators";

export function handlerValidatorAdded(event: ValidatorAdded): void {
  const validatorAddress = event.params.validator;
  _handlerValidatorAdded(
    validatorAddress,
    event.transaction.hash.toHexString(),
    BRIDGE_AMB
  );
}

export function handlerValidatorRemoved(event: ValidatorRemoved): void {
  const validatorAddress = event.params.validator;
  _handlerValidatorRemoved(
    validatorAddress,
    event.transaction.hash.toHexString(),
    BRIDGE_AMB
  );
}
