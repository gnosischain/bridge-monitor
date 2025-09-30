// import { S, experimental_createEffect } from "envio";
// import { createPublicClient, http, stringify } from "viem";
// import { mainnet } from "viem/chains";
// import { TRANSFER_TOPIC } from "../const";
// import { ADDRESSES } from "../addresses";
// import { toHexAddr } from "../utils/toHexAddress";

// export const getInitiatorFromReceipt = experimental_createEffect(
//   {
//     name: "getInitiatorFromReceipt",
//     input: { hash: S.string },
//     output: {
//       initiator: S.string,
//       initiatorToken: S.string,
//     },
//     cache: true,
//   },
//   async ({ input }) => {
//     const rpc = process.env.RPC_ETHEREUM as `http${string}` | undefined;
//     if (!rpc) {
//       return { initiator: '', initiatorToken: '' };
//     }

//     const client = createPublicClient({ chain: mainnet, transport: http(rpc) });
//     const receipt = await client.getTransactionReceipt({ hash: input.hash as `0x${string}` });
//     if (!receipt) {
//       return { initiator: '', initiatorToken: '' };
//     }

//     const allowed = [
//       ADDRESSES.FOREIGN.XDAI_BRIDGE_PERIPHERAL_FOR_DAI_PRE_USDS_UPGRADE_ADDRESS,
//       ADDRESSES.FOREIGN.XDAI_BRIDGE,
//       ADDRESSES.FOREIGN.BRIDGE_ROUTER,
//     ].map((a) => a.toLowerCase());

//     const match = receipt.logs.find((log, idx) => {
//       const topics = log.topics ?? [];
//       const isCandidate =
//         topics.length >= 3 &&
//         topics[0]?.toLowerCase() === TRANSFER_TOPIC &&
//         allowed.includes(toHexAddr(topics[2] ?? '').toLowerCase());
//       return (
//         isCandidate
//       );
//     });

//     if (!match) {
//       return { initiator: '', initiatorToken: '' };
//     }

//     const sender = toHexAddr(match.topics[1] ?? '').toLowerCase();
//     const token = String(match.address).toLowerCase();
//     const result: { initiator: string, initiatorToken: string } = { initiator: sender, initiatorToken: token };
//     return result;
//   }
// );