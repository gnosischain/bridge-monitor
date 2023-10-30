// eslint-disable-next-line @typescript-eslint/no-var-requires
const { loadEnvConfig } = require('@next/env')
// eslint-disable-next-line @typescript-eslint/no-var-requires
const endpoints = require('./src/constants/config/subgraph-endpoints.json')

if (!Object.keys(endpoints).length) {
  return
}

loadEnvConfig(process.cwd())

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

const codeGenOutDir = 'types/generated/subgraph.ts'

const schemas = [
  ...new Set(
    Object.values(endpoints).reduce((acc, current) => {
      return [
        ...acc,
        ...Object.values(current).map((endpoint) => {
          // the org registered in The Graph
          const baseUrl = `${endpoint.replace('{{org}}', ORGANIZATION)}`

          // if defined,
          // the suffix is appended with a hyphen at the end of the endpoint
          return SUFFIX ? `${baseUrl}-${SUFFIX}` : baseUrl
        }),
      ]
    }, []),
  ),
]

module.exports = {
  overwrite: true,
  schema: schemas,
  documents: 'src/queries/**/*.ts',
  generates: {
    [codeGenOutDir]: {
      plugins: [
        'typescript',
        'typescript-operations',
        'typescript-graphql-request',
        'plugin-typescript-swr',
      ],
    },
  },
  config: {
    rawRequest: false,
    autogenSWRKey: true,
  },
}
