import {
  ProxyOwnershipTransferred as ProxyOwnershipTransferredEvent,
  Upgraded as UpgradedEvent
} from "../generated/ForeignOmnibridge/ForeignOmnibridge"
import { ProxyOwnershipTransferred, Upgraded } from "../generated/schema"

export function handleProxyOwnershipTransferred(
  event: ProxyOwnershipTransferredEvent
): void {
  let entity = new ProxyOwnershipTransferred(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.previousOwner = event.params.previousOwner
  entity.newOwner = event.params.newOwner

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleUpgraded(event: UpgradedEvent): void {
  let entity = new Upgraded(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.version = event.params.version
  entity.implementation = event.params.implementation

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}
