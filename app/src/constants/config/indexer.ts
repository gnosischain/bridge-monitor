import { GraphQLClient, RequestDocument, Variables } from 'graphql-request'

const ENVIO_PROXY_URL = '/api/graphql'

export const getEnvioGraphqlClient = <Response = unknown, Vars extends Variables = Variables>() => {
  const client = new GraphQLClient(ENVIO_PROXY_URL)
  return async <R = Response, V extends Variables = Vars>(
    query: RequestDocument,
    variables?: V,
  ) => {
    return client.request<R, V>(query, variables)
  }
}
