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
const TOKEN_OVERRIDES: TokenOverrides = {
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
  // SWASH -> gnosis
  '0x84e2c67cbefae6b5148fca7d02b341b12ff4b5bb': {
    tokenOutAddress: '0xa130e3a33a4d84b04c3918c4e5762223ae252f80',
    mediator: '0x68a64df7458a8eb2677991e657508fe00205332d',
    mode: 'ERC677',
  },
  // SWASH -> mainnet
  '0xa130e3a33a4d84b04c3918c4e5762223ae252f80': {
    tokenOutAddress: '0x84e2c67cbefae6b5148fca7d02b341b12ff4b5bb',
    mediator: '0xe964a36142bbe39751d0b4d6140fc0b8c48e68be',
    mode: 'ERC677',
  },
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
    return this.overrides[normalizedAddress]
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
