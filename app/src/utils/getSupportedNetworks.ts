import { chainsConfig } from '@/src/constants/config/chains'
import { ChainConfig } from '@/src/constants/config/types'

/**
 * Returns the list of supported networks
 * @returns {Array<ChainConfig>}
 */
export function getSupportedNetworks(): Array<ChainConfig> {
  return Object.values(chainsConfig)
}
