import { DocumentNode } from 'graphql'
import { GraphQLClient } from 'graphql-request'

const NATIVE_ENDPOINT = process.env.SUBGRAPH_API_NATIVE
const FOREIGN_ENDPOINT = process.env.SUBGRAPH_API_FOREIGN

const SG_ENDPOINTS = [NATIVE_ENDPOINT, FOREIGN_ENDPOINT]

const initGraphQLClients = (apiURLs: string[]) => {
  const clients: Record<string, GraphQLClient>  = {}
  apiURLs.forEach((apiUrl) => {
    clients[apiUrl] = new GraphQLClient(apiUrl)
  })
  return clients
}

const graphqlClients = initGraphQLClients(SG_ENDPOINTS)

const useGraphqlFetcher = (apiURL: string) => <Response, Variables = void>(
  query: DocumentNode,
  variables?: Variables,
) => {
  if (!graphqlClients[apiURL]) throw new Error('graphql endpoint not initialized')
  const fetcher = graphqlClients[apiURL]
  return fetcher.request<Response>(query, variables)
}

const useNativeGraphqlClient = () => useGraphqlFetcher(NATIVE_ENDPOINT)
const useForeignGraphqlClient = () => useGraphqlFetcher(FOREIGN_ENDPOINT)

export { useNativeGraphqlClient, useForeignGraphqlClient }
