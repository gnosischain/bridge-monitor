import type { Validator as ValidatorType } from "generated";
import validators from "../seed/validators.json";
import { BridgeTypeEnum } from "../const";

export async function getValidator(
  context: any,
  signer: string
): Promise<ValidatorType | undefined> {
  const id = signer.toLowerCase();
  const existing = await context.Validator.get(id);
  if (existing) return existing as ValidatorType;

  const found = (validators as Array<any>).find(
    (v) => String(v.address).toLowerCase() === id
  );

  if (!found) {
    context.log.error(`Validator ${id} not found in validators.json`);
    return undefined;
  }

  const entity: ValidatorType = {
    id,
    address: id,
    name: found.name,
    bridgeType: found.bridgeType,
    lastActivity: undefined,
    removed: Boolean(found.removed),
    hashAdded: undefined,
    hashRemoved: undefined,
  };
  context.Validator.set(entity);
  return entity;
}


