import type { Validator as ValidatorType } from "generated";
import validators from "../seed/validators.json";

export async function getValidator(
  context: any,
  signer: string
): Promise<ValidatorType | undefined> {
  const addr = signer.toLowerCase();

  // Try existing by multiple id conventions
  let existing = await context.Validator.get(addr);
  if (existing) return existing as ValidatorType;

  existing = await context.Validator.get(`${addr}-AMB`);
  if (existing) return existing as ValidatorType;

  existing = await context.Validator.get(`${addr}-XDAI`);
  if (existing) return existing as ValidatorType;

  // Fallback to seed mapping (known validators only; do not create unknowns)
  const found = (validators as Array<any>).find(
    (v) => String(v.address).toLowerCase() === addr
  );

  if (!found) {
    context.log.error(`Validator ${addr} not found in validators.json`);
    return undefined;
  }

  const id: string = found.id ?? `${addr}-${found.bridgeType}`;
  const entity: ValidatorType = {
    id,
    address: addr,
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
