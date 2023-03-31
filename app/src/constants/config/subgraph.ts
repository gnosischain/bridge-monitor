import { DocumentNode } from 'graphql'
import { GraphQLClient } from 'graphql-request'

import endpoints from '@/src/constants/config/subgraph-endpoints.json'
import { Chains } from '@/src/constants/config/types'

/**
 * @todo this was developed in a way that there must be 1 sg deploy per network
 * but in the case of the Monitoring system we might have to use multiples SGs
 * from different networks, so the relation network -> sg, does not apply
 * we should refactor this logic
 */
const API_ENDPOINTS_KEYS = endpoints[Chains.mainnet]
const API_ENDPOINTS_LIST = Object.values(endpoints[Chains.mainnet])

export enum SubgraphName {
  BridgeMonitorForeign = 'bridge-monitor-foreign',
  BridgeMonitorHome = 'bridge-monitor-home',
}

const initGraphQLClients = (apiURLs: string[]) => {
  const clients: Record<string, GraphQLClient> = {}
  apiURLs.forEach((apiUrl) => {
    clients[apiUrl] = new GraphQLClient(apiUrl)
  })
  return clients
}
const graphqlClients = initGraphQLClients(API_ENDPOINTS_LIST)

const getGraphqlFetcher =
  (apiURL: string) =>
  <Response, Variables = void>(query: DocumentNode, variables?: Variables) => {
    if (!graphqlClients[apiURL]) throw new Error('graphql endpoint not initialized')
    const fetcher = graphqlClients[apiURL]
    return fetcher.request<Response>(query, variables ?? {})
  }

export const getHomeGraphqlClient = () =>
  getGraphqlFetcher(API_ENDPOINTS_KEYS[SubgraphName.BridgeMonitorHome])
export const getForeignGraphqlClient = () =>
  getGraphqlFetcher(API_ENDPOINTS_KEYS[SubgraphName.BridgeMonitorForeign])
