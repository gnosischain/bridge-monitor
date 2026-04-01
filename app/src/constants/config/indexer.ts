import { GraphQLClient, RequestDocument, Variables } from 'graphql-request'

const DEFAULT_ENVIO_URL =
  process.env.NEXT_PUBLIC_ENVIO_INDEXER_URL || 'http://localhost:8080/v1/graphql'

const BACKEND = (process.env.NEXT_PUBLIC_INDEXER_BACKEND || 'envio').toLowerCase() as 'envio'

export const isEnvioBackend = () => BACKEND === 'envio'

export const getEnvioGraphqlClient = <Response = unknown, Vars extends Variables = Variables>() => {
  const client = new GraphQLClient(DEFAULT_ENVIO_URL)
  return async <R = Response, V extends Variables = Vars>(
    query: RequestDocument,
    variables?: V,
  ) => {
    return client.request<R, V>(query, variables)
  }
}
