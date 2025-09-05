import { DocumentNode } from 'graphql'
import { GraphQLClient, Variables } from 'graphql-request'

const NATIVE_ENDPOINT = process.env.SUBGRAPH_API_NATIVE
const FOREIGN_ENDPOINT = process.env.SUBGRAPH_API_FOREIGN


const SG_ENDPOINTS = [NATIVE_ENDPOINT, FOREIGN_ENDPOINT].filter(Boolean) as string[]

const headers = {
  Authorization: `Bearer ${process.env.SUBGRAPH_API_KEY}`,
}

const initGraphQLClients = (apiURLs: string[]) => {
  const clients: Record<string, GraphQLClient>  = {}
  apiURLs.forEach((apiUrl) => {
    clients[apiUrl] = new GraphQLClient(apiUrl, { headers })
  })
  return clients
}

const graphqlClients = initGraphQLClients(SG_ENDPOINTS)

const useGraphqlFetcher = (apiURL: string) => <Response, TVariables extends Variables = Variables>(
  query: DocumentNode,
  variables?: TVariables,
) => {
  if (!graphqlClients[apiURL]) throw new Error('graphql endpoint not initialized')
  const fetcher = graphqlClients[apiURL]
  return fetcher.request<Response>(query, variables)
}

const useNativeGraphqlClient = () => useGraphqlFetcher(NATIVE_ENDPOINT)
const useForeignGraphqlClient = () => useGraphqlFetcher(FOREIGN_ENDPOINT)

export { useNativeGraphqlClient, useForeignGraphqlClient }
