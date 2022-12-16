import { newMockEvent } from "matchstick-as"
import { ethereum, Address, BigInt } from "@graphprotocol/graph-ts"
import { UserRequestForSignature } from "../generated/HomeBridgeErcToNative/HomeBridgeErcToNative"

export function createUserRequestForSignatureEvent(
  recipient: Address,
  value: BigInt
): UserRequestForSignature {
  let userRequestForSignatureEvent = changetype<UserRequestForSignature>(
    newMockEvent()
  )

  userRequestForSignatureEvent.parameters = new Array()

  userRequestForSignatureEvent.parameters.push(
    new ethereum.EventParam("recipient", ethereum.Value.fromAddress(recipient))
  )
  userRequestForSignatureEvent.parameters.push(
    new ethereum.EventParam("value", ethereum.Value.fromUnsignedBigInt(value))
  )

  return userRequestForSignatureEvent
}
