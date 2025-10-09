import { Validator, onBlock } from "generated";
import validators from "./seed/validators.json";

onBlock(
  {
    name: "seedValidators",
    chain: 100,
    startBlock: 23392830,
    endBlock: 23392830,
  },
  async ({ block, context }) => {
    context.log.info(`seedValidators - block: ${block.number}`);
    if (context.isPreload) return;

    for (const v of validators as Array<any>) {
      // Normalize validator id to lowercase <address>-<bridgeType> to match getValidator lookups
      const id: string = `${String(v.address).toLowerCase()}-${v.bridgeType}`;
      const entity: Validator = {
        id,
        name: v.name,
        bridgeType: v.bridgeType,
        address: String(v.address).toLowerCase(),
        lastActivity: undefined,
        removed: Boolean(v.removed),
        hashAdded: undefined,
        hashRemoved: undefined,

      };
      context.Validator.set(entity);
    }
  }
);
