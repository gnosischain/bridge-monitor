import endpoints from '@/src/constants/config/subgraph-endpoints.json'
import { DocumentNode } from 'graphql'
import { GraphQLClient } from 'graphql-request'
import memoize from 'lodash/memoize'

const getSubgraphEnvVariables = () => {
  if (!process.env.NEXT_PUBLIC_SUBGRAPH_ORGANIZATION) {
    throw Error('Missing env var NEXT_PUBLIC_SUBGRAPH_ORGANIZATION')
  }

  const ORGANIZATION = process.env.NEXT_PUBLIC_SUBGRAPH_ORGANIZATION
  const SUFFIX = process.env.NEXT_PUBLIC_SUBGRAPH_SUFFIX
    ? process.env.NEXT_PUBLIC_SUBGRAPH_SUFFIX
    : ''

  return { ORGANIZATION, SUFFIX }
}

const { ORGANIZATION, SUFFIX } = getSubgraphEnvVariables()

type ChainsPairs = keyof typeof endpoints

const getEndpointsByChain = (chainsPair: ChainsPairs) => {
  const endpointsByChainPair = endpoints[chainsPair]

  if (!endpointsByChainPair) {
    throw new Error(`No endpoints found for chain pair ${chainsPair}`)
  }

  return Object.fromEntries(
    Object.entries(endpoints[chainsPair]).map(([name, endpoint]) => {
      // the org registered in The Graph
      const baseUrl = `${endpoint.replace('{{org}}', ORGANIZATION)}`

      // if defined,
      // the suffix is appended with a hyphen at the end of the endpoint
      const finalEndpoint = SUFFIX ? `${baseUrl}-${SUFFIX}` : baseUrl

      return [name, finalEndpoint]
    }),
  )
}

export enum SubgraphName {
  BridgeMonitorForeign = 'foreign',
  BridgeMonitorHome = 'home',
}

const getGraphqlFetcher =
  (gqlClient: GraphQLClient) =>
  <Response, Variables = void>(query: DocumentNode, variables?: Variables) => {
    return gqlClient.request<Response>(query, variables ?? {})
  }

const getGraphqlClient = (chainsPair: ChainsPairs, type: SubgraphName) => {
  const apiEndpoints = getEndpointsByChain(chainsPair)
  const gqlClient = new GraphQLClient(apiEndpoints[type])
  return getGraphqlFetcher(gqlClient)
}

export const getHomeGraphqlClient = memoize((chainsPair: ChainsPairs = '100:1') =>
  getGraphqlClient(chainsPair, SubgraphName.BridgeMonitorHome),
)

export const getForeignGraphqlClient = memoize((chainsPair: ChainsPairs = '100:1') =>
  getGraphqlClient(chainsPair, SubgraphName.BridgeMonitorForeign),
)
