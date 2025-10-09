import { S, experimental_createEffect } from "envio";
import { createPublicClient, http } from "viem";
import { gnosis } from "viem/chains";
import HomeAMBAbi from "../../abi/HomeAMB.json";

export const getAmbMessageByHash = experimental_createEffect(
  {
    name: "getAmbMessageByHash",
    input: {
      address: S.string,
      messageHash: S.string,
    },
    output: S.union([S.string, null]),
    cache: true,
  },
  async ({ input }) => {
    const rpc = process.env.RPC_GNOSIS as `http${string}` | undefined;
    if (!rpc) return null;

    const client = createPublicClient({ chain: gnosis, transport: http(rpc) });

    try {
      const bytes = await client.readContract({
        address: input.address as `0x${string}`,
        abi: HomeAMBAbi as any,
        functionName: "message",
        args: [input.messageHash as `0x${string}`],
      });
      const result = typeof bytes === "string" ? bytes : (bytes as any)?.toString?.() ?? null;
      return result;
    } catch {
      return null;
    }
  }
);
