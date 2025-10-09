/**
 * Combine a 32-byte nonce with a chainId (big-endian) into a 32-byte hex string.
 *
 * @param nonce 0x-prefixed 32-byte hex string
 * @param chainId Network chain ID as number
 * @returns 0x-prefixed 32-byte hex string
 */
export function combineNonceAndChainId(nonce: string, chainId: number): string {
  const hex = (nonce.startsWith("0x") ? nonce.slice(2) : nonce).toLowerCase();
  const padded = hex.length >= 64 ? hex.slice(-64) : hex.padStart(64, "0");

  // First 4 bytes come from chainId (big-endian, 8 hex chars)
  const chainIdHex = (chainId >>> 0).toString(16).padStart(8, "0");

  // Take last 28 bytes (skip first 8 hex chars of the original 32-byte nonce)
  const tail = padded.slice(8);

  return `0x${chainIdHex}${tail}`;
}