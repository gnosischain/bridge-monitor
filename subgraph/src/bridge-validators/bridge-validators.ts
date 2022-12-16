import { Bytes, store } from "@graphprotocol/graph-ts"
import { Validator } from "../../generated/schema"
import { VALIDATORS_CONFIG } from "../config/validators"

export function _handlerValidatorAdded(validatorAddress: Bytes): void {
  const id = validatorAddress.toHexString()
  let validator = new Validator(id)
  validator.address = validatorAddress
  validator.name = 'Unknown'
  const config = VALIDATORS_CONFIG.get(id.toLowerCase())
  if (config) {
    validator.name = config.get('name')
    validator.bridgeType = config.get('bridgeType')
  }
  validator.save()
}

export function _handlerValidatorRemoved(validatorAddress: Bytes): void {
  const id = validatorAddress.toHexString()
  store.remove('Validator', id)
}
