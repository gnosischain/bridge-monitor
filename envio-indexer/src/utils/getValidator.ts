import type { Validator as ValidatorType } from "generated";
import validators from "../seed/validators.json";
import { BridgeTypeLiteral } from "../const";

export async function getValidator(
  context: any,
  signer: string,
  bridgeType: BridgeTypeLiteral
): Promise<ValidatorType | undefined> {
  const addr = signer.toLowerCase();

  // Try existing by multiple id conventions
  let existing = await context.Validator.get(addr);
  if (existing) return existing as ValidatorType;

  existing = await context.Validator.get(`${addr}-${bridgeType}`);
  if (existing) return existing as ValidatorType;

  // Fallback to seed mapping (known validators only; do not create unknowns)
  const found = (validators as Array<any>).find(
    (v) => String(v.address).toLowerCase() === addr && v.bridgeType === bridgeType
  );

  if (!found) {
    // context.log.error(`Validator ${addr} not found in validators.json`);
    return undefined;
  }

  const id: string = found.id ?? `${addr}-${bridgeType}`;
  const entity: ValidatorType = {
    id,
    address: addr,
    name: found.name,
    bridgeType: bridgeType,
    lastActivity: undefined,
    removed: Boolean(found.removed),
    hashAdded: undefined,
    hashRemoved: undefined,
  };
  context.Validator.set(entity);
  return entity;
}
