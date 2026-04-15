import { DocumentNode } from 'graphql'
import { GraphQLClient, Variables } from 'graphql-request'

const ENVIO_INDEXER_URL = process.env.ENVIO_INDEXER_URL

if (!ENVIO_INDEXER_URL) {
  throw new Error('ENVIO_INDEXER_URL environment variable is required')
}

const graphqlClient = new GraphQLClient(ENVIO_INDEXER_URL)

const useGraphqlClient = () => async <Response, TVariables extends Variables = Variables>(
  query: DocumentNode,
  variables?: TVariables,
): Promise<Response> => {
  try {
    const result = await graphqlClient.request<Response>(query, variables)
    return result
  } catch (error) {
    console.error("GraphQL Error:", error)
    throw error
  }
}

export { useGraphqlClient }
