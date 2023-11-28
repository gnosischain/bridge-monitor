import subgraphEndpointsJson from '@/src/constants/config/subgraph-endpoints.json'
import { DocumentNode } from 'graphql'
import { GraphQLClient } from 'graphql-request'
import memoize from 'lodash/memoize'

export enum SubgraphName {
  BridgeMonitorForeign = 'foreign',
  BridgeMonitorHome = 'home',
}

const getSubgraphEnvVariables = (chainPair: string) => {
  // verify NEXT_PUBLIC_SUBGRAPH_ENVIRONMENT is set with the correct value
  const ENVIRONMENT = process.env.NEXT_PUBLIC_SUBGRAPH_ENVIRONMENT as 'production' | 'development'
  if (!['development', 'production'].includes(ENVIRONMENT)) {
    throw Error(
      `Invalid value for NEXT_PUBLIC_SUBGRAPH_ENVIRONMENT: ${process.env.NEXT_PUBLIC_SUBGRAPH_ENVIRONMENT}`,
    )
  }

  // verify NEXT_PUBLIC_SUBGRAPH_ACCESS_ID is set
  const ACCESS_ID = process.env.NEXT_PUBLIC_SUBGRAPH_ACCESS_ID
  if (!ACCESS_ID) {
    throw Error('Missing env var NEXT_PUBLIC_SUBGRAPH_ACCESS_ID')
  }

  // verify NEXT_PUBLIC_SUBGRAPH_CHAINS_RESOURCE is set if env is production
  const CHAINS_RESOURCE_IDS = process.env.NEXT_PUBLIC_SUBGRAPH_CHAINS_RESOURCE_IDS
  if (!CHAINS_RESOURCE_IDS) {
    throw Error('Missing env var NEXT_PUBLIC_SUBGRAPH_CHAINS_RESOURCE')
  }

  // for dev it is: 100:v2.1.1,1:v2.1.2
  // for prod it is: 100:someID,1:someID
  const parsedResourceIds = CHAINS_RESOURCE_IDS.trim()
    .split(',')
    .map((t) => t.trim())
    .reduce((acc, tag) => {
      const [key, value] = tag.split(':')
      return { ...acc, [key]: value }
    }, {} as Record<string, string>)

  // pair is always home:foreign
  const [homeChainId, foreignChainId] = chainPair.split(':')

  if (!parsedResourceIds[homeChainId] || !parsedResourceIds[foreignChainId]) {
    throw Error(`Missing endpoint for chain pair ${chainPair}`)
  }

  const RESOURCE_ID_BY_BRIDGE: Record<string, string> = {
    home: parsedResourceIds[homeChainId],
    foreign: parsedResourceIds[foreignChainId],
  }

  return { ENVIRONMENT, ACCESS_ID, RESOURCE_ID_BY_BRIDGE }
}

const getEndpointsByChain = (chainsPair: string) => {
  const endpointsByChainPair = subgraphEndpointsJson[chainsPair]
  if (!endpointsByChainPair) {
    throw new Error(`No endpoints found for chain pair ${chainsPair}`)
  }

  const { ACCESS_ID, ENVIRONMENT, RESOURCE_ID_BY_BRIDGE } = getSubgraphEnvVariables(chainsPair)

  const endpointsArray = Object.entries(subgraphEndpointsJson[chainsPair]).map(
    ([bridgeSideName, environments]) => {
      const endpoint = environments[ENVIRONMENT].replace('{{accessId}}', ACCESS_ID).replace(
        '{{resourceId}}',
        RESOURCE_ID_BY_BRIDGE[bridgeSideName],
      )

      return [bridgeSideName, endpoint]
    },
  )

  return Object.fromEntries(endpointsArray)
}

const getGraphqlFetcher =
  (gqlClient: GraphQLClient) =>
  <Response, Variables = void>(query: DocumentNode, variables?: Variables) => {
    return gqlClient.request<Response>(query, variables ?? {})
  }

const getGraphqlClient = (chainsPair: string, type: SubgraphName) => {
  const apiEndpoints = getEndpointsByChain(chainsPair)
  const gqlClient = new GraphQLClient(apiEndpoints[type])
  return getGraphqlFetcher(gqlClient)
}

export const getHomeGraphqlClient = memoize((chainsPair = '100:1') =>
  getGraphqlClient(chainsPair, SubgraphName.BridgeMonitorHome),
)

export const getForeignGraphqlClient = memoize((chainsPair = '100:1') =>
  getGraphqlClient(chainsPair, SubgraphName.BridgeMonitorForeign),
)
