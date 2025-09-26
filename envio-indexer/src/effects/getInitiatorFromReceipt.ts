import { S, experimental_createEffect } from "envio";
import { createPublicClient, http } from "viem";
import { mainnet } from "viem/chains";
import { TRANSFER_TOPIC } from "../const";
import { ADDRESSES } from "../addresses";
import { toHexAddr } from "../utils/toHexAddress";

const cache = new Map<string, string[] | null>();

export const getInitiatorFromReceipt = experimental_createEffect(
  {
    name: "getInitiatorFromReceipt",
    input: { hash: S.string },
    output: S.union([S.array(S.string), null]),
  },
  async ({ input }) => {
    const key = `${input.hash}`;
    if (cache.has(key)) return cache.get(key) ?? null;

    const rpc = process.env.RPC_ETHEREUM as `http${string}` | undefined;
    if (!rpc) return null;

    const client = createPublicClient({ chain: mainnet, transport: http(rpc) });
    const receipt = await client.getTransactionReceipt({ hash: input.hash as `0x${string}` });
    if (!receipt) {
      cache.set(key, null);
      return null;
    }

    const allowed = [
      ADDRESSES.FOREING.XDAI_BRIDGE_PERIPHERAL_FOR_DAI_PRE_USDS_UPGRADE_ADDRESS,
      ADDRESSES.FOREING.XDAI_BRIDGE,
      ADDRESSES.FOREING.BRIDGE_ROUTER,
    ].map((a) => a.toLowerCase());

    const match = receipt.logs.find((log) => {
      const topics = log.topics ?? [];
      return (
        topics.length >= 3 &&
        topics[0]?.toLowerCase() === TRANSFER_TOPIC &&
        allowed.includes(toHexAddr(topics[2] ?? '').toLowerCase())
      );
    });

    if (!match) {
      cache.set(key, null);
      return null;
    }

    const sender = toHexAddr(match.topics[1] ?? '').toLowerCase();
    const token = String(match.address).toLowerCase();
    const result: string[] = [sender, token];
    cache.set(key, result);
    return result;
  }
);