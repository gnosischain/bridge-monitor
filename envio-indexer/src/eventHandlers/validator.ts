import { indexer, AMBBridgeValidators, Validator, XDAIBridgeValidators } from "envio";
import { BridgeTypeEnum, BridgeTypeLiteral } from "../const";
import validators from "../seed/validators.json";
 
async function upsertValidatorAdded(
  context: any,
  addr: string,
  bridgeType: BridgeTypeLiteral,
  txHash: string
) {
  const id = `${addr}-${bridgeType}`;
  const existing = await context.Validator.get(id);
  const validatorName: string | undefined = (validators as Array<any>).find(
    (v) => String(v.id).toLowerCase() === id.toLowerCase()
  )?.name;
  
  if (!existing) {
    const entity: Validator = {
      id,
      name: validatorName,
      bridgeType,
      address: addr,
      lastActivity: undefined,
      removed: false,
      hashAdded: txHash,
      hashRemoved: undefined,
    };
    context.Validator.set(entity);
  } else {
    const updated: Validator = {
      ...existing,
      name: existing.name ?? validatorName,
      bridgeType,
      address: addr,
      removed: false,
      hashAdded: txHash,
      hashRemoved: undefined,
    };
    context.Validator.set(updated);
  }
}

async function markValidatorRemoved(
  context: any,
  addr: string,
  bridgeType: BridgeTypeLiteral,
  txHash: string
) {
  const id = `${addr}-${bridgeType}`;
  const existing = await context.Validator.get(id);
  const validatorName: string | undefined = (validators as Array<any>).find(
    (v) => String(v.id).toLowerCase() === id.toLowerCase()
  )?.name;

  if (!existing) {
    const entity: Validator = {
      id,
      name: validatorName,
      bridgeType,
      address: addr,
      lastActivity: undefined,
      removed: true,
      hashAdded: undefined,
      hashRemoved: txHash,
    };
    context.Validator.set(entity);
    return;
  }
  const updated: Validator = {
    ...existing,
    name: existing.name ?? validatorName,
    removed: true,
    hashRemoved: txHash,
  };
  context.Validator.set(updated);
}

indexer.onEvent(
  { contract: "XDAIBridgeValidators", event: "ValidatorAdded" },
  async ({ event, context }) => {
  const addr = String(event.params.validator).toLowerCase();
  await upsertValidatorAdded(context, addr, BridgeTypeEnum.XDAI, event.transaction.hash);
}
);

indexer.onEvent(
  { contract: "XDAIBridgeValidators", event: "ValidatorRemoved" },
  async ({ event, context }) => {
  const addr = String(event.params.validator).toLowerCase();
  await markValidatorRemoved(context, addr, BridgeTypeEnum.XDAI, event.transaction.hash);
}
);

indexer.onEvent(
  { contract: "AMBBridgeValidators", event: "ValidatorAdded" },
  async ({ event, context }) => {
  const addr = String(event.params.validator).toLowerCase();
  await upsertValidatorAdded(context, addr, BridgeTypeEnum.AMB, event.transaction.hash);
}
);

indexer.onEvent(
  { contract: "AMBBridgeValidators", event: "ValidatorRemoved" },
  async ({ event, context }) => {
  const addr = String(event.params.validator).toLowerCase();
  await markValidatorRemoved(context, addr, BridgeTypeEnum.AMB, event.transaction.hash);
}
);