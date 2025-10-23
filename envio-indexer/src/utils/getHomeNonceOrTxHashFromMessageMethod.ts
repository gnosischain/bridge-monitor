export function getHomeNonceOrTxHashFromMessageMethod(message: string | Uint8Array): string {
  const hexWithPrefix = typeof message === "string"
    ? (message.startsWith("0x") ? message : `0x${message}`)
    : `0x${Array.from(message).map(b => b.toString(16).padStart(2, "0")).join("")}`;

  const hex = hexWithPrefix.slice(2); // drop 0x
  return `0x${hex.slice(104, 168)}`;
}