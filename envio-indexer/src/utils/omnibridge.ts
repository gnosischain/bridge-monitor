/**
 * encodedData layout (hex string):
 * - [0..66):  0x + 64 hex (messageId)
 * - [66..106): origin mediator (40 hex, no 0x)
 * - [106..146): destination mediator (40 hex, no 0x)
 * - receiver is later in payload; subgraph slices [260..300)
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

// Extract receiver from encodedData (subgraph uses slice [260..300))
export function extractReceiverFromEncodedData(encodedData?: string): string | undefined {
  if (!encodedData || encodedData.length < 300) return undefined;
  return "0x" + encodedData.slice(260, 300);
}
