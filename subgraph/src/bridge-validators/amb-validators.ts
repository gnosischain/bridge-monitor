import { ValidatorAdded, ValidatorRemoved } from "../../generated/AMBBridgeValidators/BridgeValidators"
import { _handlerValidatorAdded, _handlerValidatorRemoved } from "./bridge-validators"

export function handlerValidatorAdded(event: ValidatorAdded): void {
  const validatorAddress = event.params.validator
  _handlerValidatorAdded(validatorAddress)
}

export function handlerValidatorRemoved(event: ValidatorRemoved): void {
  const validatorAddress = event.params.validator
  _handlerValidatorRemoved(validatorAddress)
}
