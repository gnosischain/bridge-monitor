import { newMockEvent } from "matchstick-as"
import { ethereum, Address, BigInt } from "@graphprotocol/graph-ts"
import {
  ProxyOwnershipTransferred,
  Upgraded
} from "../generated/ForeignOmnibridge/ForeignOmnibridge"

export function createProxyOwnershipTransferredEvent(
  previousOwner: Address,
  newOwner: Address
): ProxyOwnershipTransferred {
  let proxyOwnershipTransferredEvent = changetype<ProxyOwnershipTransferred>(
    newMockEvent()
  )

  proxyOwnershipTransferredEvent.parameters = new Array()

  proxyOwnershipTransferredEvent.parameters.push(
    new ethereum.EventParam(
      "previousOwner",
      ethereum.Value.fromAddress(previousOwner)
    )
  )
  proxyOwnershipTransferredEvent.parameters.push(
    new ethereum.EventParam("newOwner", ethereum.Value.fromAddress(newOwner))
  )

  return proxyOwnershipTransferredEvent
}

export function createUpgradedEvent(
  version: BigInt,
  implementation: Address
): Upgraded {
  let upgradedEvent = changetype<Upgraded>(newMockEvent())

  upgradedEvent.parameters = new Array()

  upgradedEvent.parameters.push(
    new ethereum.EventParam(
      "version",
      ethereum.Value.fromUnsignedBigInt(version)
    )
  )
  upgradedEvent.parameters.push(
    new ethereum.EventParam(
      "implementation",
      ethereum.Value.fromAddress(implementation)
    )
  )

  return upgradedEvent
}
