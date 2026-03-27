/**
 * encodedData layout (hex string):
 * - [0..66):    0x + messageId (32 bytes = 64 hex)
 * - [66..106):  origin mediator (20 bytes = 40 hex)
 * - [106..146): destination mediator (20 bytes = 40 hex)
 * - [146..154): gasLimit (4 bytes = 8 hex)   ← 4 bytes, not 8!
 * - [154..160): chainLengths + dataType (3 bytes = 6 hex)
 * - [160..164): chainIds (2×1-byte for ETH/GC = 4 hex)
 * - [164..]:    calldata for handleBridgedTokens(token, receiver, value)
 *               - selector: 4 bytes  [164..172)
 *               - token: 32 bytes    [172..236), address at [196..236)
 *               - receiver: 32 bytes [236..300), address at [260..300)
 *               - value: 32 bytes    [300..364)
 */

// Known OmniBridge mediator addresses (lowercased)
const HOME_MEDIATORS = new Set<string>([
  // Canonical home mediator
  "0xf6a78083ca3e2a662d6dd1703c939c8ace2e268d",
  // Overrides
  "0xbed794745e2a0543ee609795ade87a55bbe935ba",
  "0xf75c28fe07e0647b05160288f172ad27cccd8f30",
  "0x0eeacdb0dd96588711581c5f3173dd55841b8e91",
  "0x53f3f44c434494da73ec44a6e8a8d091332bc2ce",
  "0x7d55f9981d4e10a193314e001b96f72fcc901e40",
  "0xbe20f60339b06db32c319d46cf3bc9bacc0694ab",
  "0x68a64df7458a8eb2677991e657508fe00205332d",
  "0x5f0fe58709639a39c193521d919afaef02e570f7",
]);

const FOREIGN_MEDIATORS = new Set<string>([
  // Canonical foreign mediator
  "0x88ad09518695c6c3712ac10a214be5109a655671",
  // Overrides
  "0xed7e6720ac8525ac1aeee710f08789d02cd87ecb",
  "0xe7228b4ebad37ba031a8b63473727f991e262dcd",
  "0x81a4833b3a40e7c61efe9d1a287343797993b1e8",
  "0x29e572d45cc33d5a68dcc8f92bfc7ded0017bc59",
  "0x2eeeddeece91c9f4c5ba4c8e1d784a0234c6d015",
  "0x5689c65cfe5e8bf1a5f836c956dea1b3b8be00bb",
  "0xe964a36142bbe39751d0b4d6140fc0b8c48e68be",
  "0x41a4ee2855a7dc328524babb07d7f505b201133e",
]);

// Router/wrapper contracts that shouldn't be shown as receiver
// When these are detected as receiver, we should fall back to sender
const ROUTER_CONTRACTS = new Set<string>([
  // WETHOmnibridgeRouter on Ethereum - wraps/unwraps ETH<>WETH
  "0xa6439ca0fcba1d0f80df0be6a17220fed9c9038a",
]);

/**
 * Check if an address is a router/wrapper contract that shouldn't be shown as final receiver
 */
export function isRouterContract(addr?: string): boolean {
  if (!addr) return false;
  return ROUTER_CONTRACTS.has(addr.toLowerCase());
}

// Returns true if encodedData indicates OmniBridge usage (canonical or override mediators)
export function isOmniBridgeUsage(encodedData?: string): boolean {
  if (!encodedData || encodedData.length < 146) return false;
  const msg = encodedData.toLowerCase();
  // Slices omit 0x and include 40-hex mediator without 0x
  const origin = "0x" + msg.slice(66, 106);
  const dest = "0x" + msg.slice(106, 146);
  const originIsHome = HOME_MEDIATORS.has(origin);
  const originIsForeign = FOREIGN_MEDIATORS.has(origin);
  const destIsHome = HOME_MEDIATORS.has(dest);
  const destIsForeign = FOREIGN_MEDIATORS.has(dest);
  // Either direction (Home->Foreign or Foreign->Home)
  return (originIsHome && destIsForeign) || (originIsForeign && destIsHome);
}

/**
 * Check if an address is "zero-ish" (mostly zeros, likely invalid extraction)
 * Examples: 0x00000000000000000000000000000000000000c0
 */
export function isZeroishAddress(addr?: string): boolean {
  if (!addr) return true;
  const withoutPrefix = addr.toLowerCase().replace("0x", "");
  if (withoutPrefix.length !== 40) return true;
  // Count non-zero characters - a valid address should have more than 4
  const nonZeroChars = withoutPrefix.replace(/0/g, "");
  return nonZeroChars.length <= 4;
}

/**
 * Extract receiver from encodedData.
 * The receiver is in the calldata portion which calls handleBridgedTokens(token, receiver, value).
 * Position varies based on chain ID encoding in the AMB header.
 * Returns undefined if extraction fails or produces an invalid address.
 *
 * Special case — WETH GC→ETH: the AMB message calls
 * handleBridgedTokensAndCall(token, router, value, data) where the actual recipient
 * is NOT the router at [260..300) but a raw 20-byte address (abi.encodePacked)
 * inside the `data` field at [492..532). We skip router addresses in the primary
 * loop and fall back to that offset so callers always receive the real recipient.
 */
export function extractReceiverFromEncodedData(encodedData?: string): string | undefined {
  if (!encodedData || encodedData.length < 308) return undefined;

  // Primary offset: receiver address is the last 40 chars of the 2nd calldata param [236..300)
  // gasLimit is 4 bytes (not 8), so calldata starts at char 164 → receiver address at [260..300)
  if (encodedData.length >= 300) {
    const primary = "0x" + encodedData.slice(260, 300);
    if (!isZeroishAddress(primary)) {
      if (!isRouterContract(primary)) {
        return primary;
      }
      // Router at primary offset → WETH GC→ETH: actual recipient is
      // abi.encodePacked(address) in the `data` field, left-aligned at [492..532).
      // Skip fallback offsets — they would slice mid-router-address producing garbage.
      if (encodedData.length >= 532) {
        const wethCandidate = "0x" + encodedData.slice(492, 532);
        if (!isZeroishAddress(wethCandidate)) {
          return wethCandidate;
        }
      }
      return undefined;
    }
  }

  // Fallback offsets for edge cases where chain ID encoding shifts the calldata
  // (only reached when primary offset [260..300) is zero-ish, not a router case)
  for (const offset of [268, 252]) {
    if (encodedData.length >= offset + 40) {
      const candidate = "0x" + encodedData.slice(offset, offset + 40);
      if (!isZeroishAddress(candidate)) {
        return candidate;
      }
    }
  }

  return undefined;
}

/** Parse messageId (bytes32) from AMB encodedData bytes hex (first 32 bytes after 0x) */
export function parseMessageIdFromEncodedData(encodedData?: string): string | undefined {
  if (!encodedData) return undefined;
  const hex = encodedData.toLowerCase();
  if (!hex.startsWith("0x") || hex.length < 66) return undefined;
  return "0x" + hex.slice(2, 66);
}
