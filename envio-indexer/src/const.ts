export const CHAIN = {
  FOREIGN: {
    ID: 1,
    NAME: "ethereum",
  },
  HOME: {
    ID: 100,
    NAME: "gnosis",
  },
}

export const TRANSFER_TOPIC = "0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef";
export const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";

export const BridgeTypeEnum = {
  XDAI: "XDAI",
  AMB: "AMB",
} as const;
export type BridgeTypeLiteral = (typeof BridgeTypeEnum)[keyof typeof BridgeTypeEnum];

export const TransactionStatusEnum = {
  INITIATED: "INITIATED",
  COLLECTING: "COLLECTING",
  UNCLAIMED: "UNCLAIMED",
  COMPLETED: "COMPLETED",
  ERROR: "ERROR",
} as const;
export type TransactionStatusLiteral = (typeof TransactionStatusEnum)[keyof typeof TransactionStatusEnum];

export const RPC_HOME = process.env.ENVIO_RPC_HOME || 'https://rpc.gnosischain.com' as `http${string}`;
