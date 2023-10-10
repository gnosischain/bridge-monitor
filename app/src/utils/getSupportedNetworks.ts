import { chainsConfig } from '@/src/constants/config/chains'
import subgraphEndpoints from '@/src/constants/config/subgraph-endpoints.json'
import { ChainConfig } from '@/src/constants/config/types'

/**
 * Returns the list of supported networks, i.e. the ones that have a subgraph endpoint
 * @returns {Array<ChainConfig>}
 */
export function getSupportedNetworks(): Array<ChainConfig> {
  const allNetworks = Object.values(chainsConfig)
  const foreignNetworksIds = Object.entries(subgraphEndpoints).map(([key]) => {
    // from the key structured as `${home}:${foreign}` we only need the foreign part
    return +key.split(':')[1]
  })

  return allNetworks.filter((network) => {
    return foreignNetworksIds.includes(network.id)
  })
}
