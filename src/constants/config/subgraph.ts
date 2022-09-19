import { GraphQLClient } from 'graphql-request'
import nullthrows from 'nullthrows'

import endpoints from '@/src/constants/config/subgraph-endpoints.json'
import { ChainsValues } from '@/src/constants/config/types'
import { SdkWithHooks, getSdkWithHooks } from '@/types/generated/subgraph'
import { DocumentNode } from 'graphql'

export type AllSDK = Record<ChainsValues, SdkWithHooks>

/**
 * @todo this was developed in a way that there must be 1 sg deploy per network
 * but in the case of the Monitoring system we might have to use multiples SGs
 * from different networks, so the relation network -> sg, does not apply
 * we might need to refactor this logic
 */

const API_ENDPOINTS_KEYS = endpoints[1]
const API_ENDPOINTS_LIST = Object.values(endpoints[1])

export enum SubgraphName {
  Rentals = 'sandbox',
  BridgeMonitorForeign = "bridge-monitor-foreign",
  BridgeMonitorNative = "bridge-monitor-native"
}
const initGraphQLClients = (apiURLs: string[]) => {
  const clients: Record<string, GraphQLClient>  = {}
  apiURLs.forEach((apiUrl) => {
    clients[apiUrl] = new GraphQLClient(apiUrl)
  })
  return clients
}
const graphqlClients = initGraphQLClients(API_ENDPOINTS_LIST)

export function getSubgraphSdkByNetwork(
  chainId: ChainsValues,
  subgraphName: SubgraphName,
): ReturnType<typeof getSdkWithHooks> {
  const networkConfig = getSdkWithHooks(new GraphQLClient(endpoints[chainId][subgraphName]))
  return nullthrows(networkConfig, `No sdk for chain id: ${chainId}`)
}

const useGraphqlFetcher = (apiURL: string) => <Response, Variables = void>(
  query: DocumentNode,
  variables?: Variables,
) => {
  if (!graphqlClients[apiURL]) throw new Error('graphql endpoint not initialized')
  const fetcher = graphqlClients[apiURL]
  return fetcher.request<Response>(query, variables)
}

export const useNativeGraphqlClient = () => useGraphqlFetcher(API_ENDPOINTS_KEYS[SubgraphName.BridgeMonitorNative])
export const useForeignGraphqlClient = () => useGraphqlFetcher(API_ENDPOINTS_KEYS[SubgraphName.BridgeMonitorForeign])
