
export const erc677BridgeToTokenMapping = {
    "0xe964a36142bbe39751d0b4d6140fc0b8c48e68be": "0xA130E3a33a4d84b04c3918c4E5762223Ae252F80",
    "0xed7e6720ac8525ac1aeee710f08789d02cd87ecb": "0xed7e6720ac8525ac1aeee710f08789d02cd87ecb",
    "0xe7228b4ebad37ba031a8b63473727f991e262dcd": "0xe1cA72ff3434B131765c62Cbcbc26060F7Aba03D",
    "0x81a4833b3a40e7c61efe9d1a287343797993b1e8": "0xc3589F56B6869824804A5EA29F2c9886Af1B0FcE",
    "0x29e572d45cc33d5a68dcc8f92bfc7ded0017bc59": "0x8f693ca8D21b157107184d29D398A8D082b38b76",
    "0x2eeeddeece91c9f4c5ba4c8e1d784a0234c6d015": "0x0Cf0Ee63788A0849fE5297F3407f701E122cC023",
    "0x5689c65cfe5e8bf1a5f836c956dea1b3b8be00bb": "0x0b006E475620Af076915257C6A9E40635AbdBBAd",
    "0x41a4ee2855a7dc328524babb07d7f505b201133e": "0x90DE74265a416e1393A450752175AED98fe11517",
    "0xbed794745e2a0543ee609795ade87a55bbe935ba": "0x0905Ab807F8FD040255F0cF8fa14756c1D824931",
    "0xf75c28fe07e0647b05160288f172ad27cccd8f30": "0x1e16aa4Df73d29C029d94CeDa3e3114EC191E25A",
    "0x0eeacdb0dd96588711581c5f3173dd55841b8e91": "0x71850b7E9Ee3f13Ab46d67167341E4bDc905Eef9",
    "0x53f3f44c434494da73ec44a6e8a8d091332bc2ce": "0x256eb8a51f382650B2A1e946b8811953640ee47D",
    "0x7d55f9981d4e10a193314e001b96f72fcc901e40": "0xE4a2620edE1058D61BEe5F45F6414314fdf10548",
    "0xbe20f60339b06db32c319d46cf3bc9bacc0694ab": "0x3a97704a1b25F08aa230ae53B352e2e72ef52843",
    "0x68a64df7458a8eb2677991e657508fe00205332d": "0x84E2C67CBEfae6B5148fcA7d02B341B12ff4b5Bb",
    "0x5f0fe58709639a39c193521d919afaef02e570f7": "0x8C84142c4a716a16a89d0e61707164d6107A9811"
} as const;

export type ERC677BridgeAddress = keyof typeof erc677BridgeToTokenMapping;

// Type guard to check if an address is a valid ERC677 bridge
export function isERC677Bridge(address: string): address is ERC677BridgeAddress {
    return address.toLowerCase() in erc677BridgeToTokenMapping;
}

// Safe getter with normalization
export function getTokenForBridge(bridgeAddress: string): string | undefined {
    const normalized = bridgeAddress.toLowerCase() as ERC677BridgeAddress;
    return erc677BridgeToTokenMapping[normalized];
}