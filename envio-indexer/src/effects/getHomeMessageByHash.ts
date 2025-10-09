import { S, experimental_createEffect } from "envio";
import { createPublicClient, http } from "viem";
import { gnosis } from "viem/chains";
import HomeBridgeAbi from "../../abi/HomeBridgeErcToNative.json";

export const getHomeMessageByHash = experimental_createEffect(
  {
    name: "getHomeMessageByHash",
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
        abi: HomeBridgeAbi as any,
        functionName: "message",
        args: [input.messageHash as `0x${string}`],
      });
      // viem returns Hex for bytes output, ensure string
      const result = typeof bytes === "string" ? bytes : (bytes as any).toString();
      return result;
    } catch (err) {
      return null;
    }
  }
);


