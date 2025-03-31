import { contracts } from '@/src/constants/config/contracts'
import { ChainsValues } from '@/src/constants/config/types'
import { TOKEN_MODE } from '@/src/hooks/bridge/useTokenMode'

interface TokenOverride {
  tokenOutAddress: string
  mediator: string
  mode: TOKEN_MODE
}

type TokenOverrides = Record<string, TokenOverride>

// NOTE: All the keys and values in the tokenOverrides object must be in lowercase.
const TOKEN_OVERRIDES: Record<
  string,
  { tokenOutAddress: string; mediator: string; mode: TOKEN_MODE }
> = {
  // // OWL Token -> gnosis
  // '0x0905ab807f8fd040255f0cf8fa14756c1d824931': {
  //   tokenOutAddress: '0x1a5f9352af8af974bfc03399e3767df6370d82e4',
  //   mediator: '0xbed794745e2a0543ee609795ade87a55bbe935ba',
  //   mode: 'ERC677',
  // },
  // // OWL Token -> mainnet
  // '0x1a5f9352af8af974bfc03399e3767df6370d82e4': {
  //   tokenOutAddress: '0x0905ab807f8fd040255f0cf8fa14756c1d824931',
  //   mediator: '0xed7e6720Ac8525Ac1AEee710f08789D02cD87ecB',
  //   mode: 'D-ERC20',
  // },
  // Link -> gnosis
  '0xe2e73a1c69ecf83f464efce6a5be353a37ca09b2': {
    tokenOutAddress: '0x514910771af9ca656af840dff83e8264ecf986ca',
    mediator: '0xf6a78083ca3e2a662d6dd1703c939c8ace2e268d',
    mode: 'ERC677',
  },
  // link -> mainnet
  '0x514910771af9ca656af840dff83e8264ecf986ca': {
    tokenOutAddress: '0xe2e73a1c69ecf83f464efce6a5be353a37ca09b2',
    mediator: '0x88ad09518695c6c3712ac10a214be5109a655671',
    mode: 'ERC677',
  },
  // Stake -> gnosis
  '0xb7d311e2eb55f2f68a9440da38e7989210b9a05e': {
    tokenOutAddress: '0x0ae055097c6d159879521c384f1d2123d1f195e6',
    mediator: '0xf6a78083ca3e2a662d6dd1703c939c8ace2e268d',
    mode: 'ERC677',
  },
  // Stake -> mainnet
  '0x0ae055097c6d159879521c384f1d2123d1f195e6': {
    tokenOutAddress: '0xb7d311e2eb55f2f68a9440da38e7989210b9a05e',
    mediator: '0x88ad09518695c6c3712ac10a214be5109a655671',
    mode: 'ERC677',
  },
  // // Moon -> gnosis
  // '0x1e16aa4df73d29c029d94ceda3e3114ec191e25a': {
  //   tokenOutAddress: '0xe1ca72ff3434b131765c62cbcbc26060f7aba03d',
  //   mediator: '0xf75c28fe07e0647b05160288f172ad27cccd8f30',
  //   mode: 'ERC677',
  // },
  // // Moon -> mainnet
  // '0xe1ca72ff3434b131765c62cbcbc26060f7aba03d': {
  //   tokenOutAddress: '0x1e16aa4df73d29c029d94ceda3e3114ec191e25a',
  //   mediator: '0xe7228b4ebad37ba031a8b63473727f991e262dcd',
  //   mode: 'ERC677',
  // },
  // // HNY -> gnosis
  // '0x71850b7e9ee3f13ab46d67167341e4bdc905eef9': {
  //   tokenOutAddress: '0xc3589f56b6869824804a5ea29f2c9886af1b0fce',
  //   mediator: '0x0eeacdb0dd96588711581c5f3173dd55841b8e91',
  //   mode: 'D-ERC20',
  // },
  // // HNY -> mainnet
  // '0xc3589f56b6869824804a5ea29f2c9886af1b0fce': {
  //   tokenOutAddress: '0x71850b7e9ee3f13ab46d67167341e4bdc905eef9',
  //   mediator: '0x81a4833b3a40e7c61efe9d1a287343797993b1e8',
  //   mode: 'ERC677',
  // },
  // DATA -> gnosis
  // '0x256eb8a51f382650b2a1e946b8811953640ee47d': {
  //   tokenOutAddress: '0x8f693ca8d21b157107184d29d398a8d082b38b76',
  //   mediator: '0x53f3f44c434494da73ec44a6e8a8d091332bc2ce',
  //   mode: 'D-ERC20',
  // },
  // // DATA -> mainnet
  // '0x8f693ca8d21b157107184d29d398a8d082b38b76': {
  //   tokenOutAddress: '0x256eb8a51f382650b2a1e946b8811953640ee47d',
  //   mediator: '0x29e572d45cc33d5a68dcc8f92bfc7ded0017bc59',
  //   mode: 'D-ERC20',
  // },
  // // XDATA -> gnosis
  // '0xe4a2620ede1058d61bee5f45f6414314fdf10548': {
  //   tokenOutAddress: '0x0cf0ee63788a0849fe5297f3407f701e122cc023',
  //   mediator: '0x7d55f9981d4e10a193314e001b96f72fcc901e40',
  //   mode: 'D-ERC20',
  // },
  // // XDATA -> mainnet
  // '0x0cf0ee63788a0849fe5297f3407f701e122cc023': {
  //   tokenOutAddress: '0xe4a2620ede1058d61bee5f45f6414314fdf10548',
  //   mediator: '0x2eeeddeece91c9f4c5ba4c8e1d784a0234c6d015',
  //   mode: 'D-ERC20',
  // },
  // // AGVE -> gnosis
  // '0x3a97704a1b25f08aa230ae53b352e2e72ef52843': {
  //   tokenOutAddress: '0x0b006e475620af076915257c6a9e40635abdbbad',
  //   mediator: '0xbe20f60339b06db32c319d46cf3bc9bacc0694ab',
  //   mode: 'D-ERC20',
  // },
  // // AGVE -> mainnet
  // '0x0b006e475620af076915257c6a9e40635abdbbad': {
  //   tokenOutAddress: '0x3a97704a1b25f08aa230ae53b352e2e72ef52843',
  //   mediator: '0x5689c65cfe5e8bf1a5f836c956dea1b3b8be00bb',
  //   mode: 'ERC677',
  // },
  // // SWASH -> gnosis
  // '0x84e2c67cbefae6b5148fca7d02b341b12ff4b5bb': {
  //   tokenOutAddress: '0xa130e3a33a4d84b04c3918c4e5762223ae252f80',
  //   mediator: '0x68a64df7458a8eb2677991e657508fe00205332d',
  //   mode: 'ERC677',
  // },
  // // SWASH -> mainnet
  // '0xa130e3a33a4d84b04c3918c4e5762223ae252f80': {
  //   tokenOutAddress: '0x84e2c67cbefae6b5148fca7d02b341b12ff4b5bb',
  //   mediator: '0xe964a36142bbe39751d0b4d6140fc0b8c48e68be',
  //   mode: 'ERC677',
  // },
  // // UDT -> gnosis
  // '0x8c84142c4a716a16a89d0e61707164d6107a9811': {
  //   tokenOutAddress: '0x90de74265a416e1393a450752175aed98fe11517',
  //   mediator: '0x5f0fe58709639a39c193521d919afaef02e570f7',
  //   mode: 'ERC677',
  // },
  // // UDT -> mainnet
  // '0x90de74265a416e1393a450752175aed98fe11517': {
  //   tokenOutAddress: '0x8c84142c4a716a16a89d0e61707164d6107a9811',
  //   mediator: '0x41a4ee2855a7dc328524babb07d7f505b201133e',
  //   mode: 'D-ERC20',
  // },
}

// Utility function for normalizing token addresses.
function normalizeTokenAddress(tokenAddress: string): string | null {
  if (typeof tokenAddress !== 'string' || !tokenAddress.trim()) {
    console.warn('Invalid token address provided.')
    return null
  }
  return tokenAddress.toLowerCase()
}

/**
 * Manages token overrides for the bridge monitor.
 */
class TokenOverrideManager {
  private overrides: TokenOverrides

  constructor(overrides: TokenOverrides) {
    this.overrides = overrides
  }

  /**
   * Checks if a token address is overridden.
   * @param tokenAddress - The token address to check.
   * @returns A boolean indicating if the token address is overridden.
   */
  isOverridden(tokenAddress: string): boolean {
    const normalizedAddress = normalizeTokenAddress(tokenAddress)
    if (!normalizedAddress) {
      return false
    }
    return normalizedAddress in this.overrides
  }

  /**
   * Gets the override for a token address.
   * @param tokenAddress - The token address to get the override for.
   * @returns The token override, if it exists.
   */
  getOverride(tokenAddress: string): TokenOverride {
    const normalizedAddress = normalizeTokenAddress(tokenAddress)
    if (!normalizedAddress) {
      throw new Error('Invalid token address provided.')
    }
    return this.overrides[normalizedAddress] ?? undefined
  }

  /**
   * Checks if a mediator is overridden for a token address and chain ID.
   * @param tokenAddress - The token address.
   * @param fromChainId - The chain ID.
   * @returns A boolean indicating if the mediator is overridden.
   */
  isMediatorOverridden(tokenAddress?: string, fromChainId?: ChainsValues): boolean {
    if (!tokenAddress || !fromChainId) return false
    const override = this.getOverride(tokenAddress)
    if (!override) return false

    const overriddenMediator = override.mediator.toLowerCase()
    const commonMediatorsAddresses = this.getCommonMediatorsAddresses(fromChainId)

    return !commonMediatorsAddresses.includes(overriddenMediator)
  }

  /**
   * Gets the common mediators addresses for the given chain.
   * @param fromChainId - The chain ID.
   * @returns An array of common mediators addresses.
   */
  private getCommonMediatorsAddresses(fromChainId: ChainsValues): string[] {
    return [
      contracts.XDAIBridge.address[fromChainId],
      contracts.OmniBridge.address[fromChainId],
      contracts.omniBridgeNativeToken.address[fromChainId],
    ]
      .map((address) => address?.toLowerCase())
      .filter(Boolean) as string[]
  }
}

const overrideManager = new TokenOverrideManager(TOKEN_OVERRIDES)

export { overrideManager as TokenOverrideManager }
