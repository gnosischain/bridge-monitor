// eslint-disable-next-line @typescript-eslint/no-var-requires
const { loadEnvConfig } = require('@next/env')
// eslint-disable-next-line @typescript-eslint/no-var-requires
const subgraphEndpoints = require('./src/constants/config/subgraph-endpoints.json')
const codeGenOutDir = 'types/generated/subgraph.ts'

if (!Object.keys(subgraphEndpoints).length) {
  return
}

loadEnvConfig(process.cwd())

const getSubgraphEnvVariables = (chainPair) => {
  // verify NEXT_PUBLIC_SUBGRAPH_ENVIRONMENT is set with the correct value
  const ENVIRONMENT = process.env.NEXT_PUBLIC_SUBGRAPH_ENVIRONMENT
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
    }, {})

  // pair is always home:foreign
  const [homeChainId, foreignChainId] = chainPair.split(':')

  if (!parsedResourceIds[homeChainId] || !parsedResourceIds[foreignChainId]) {
    throw Error(`Missing endpoint for chain pair ${chainPair}`)
  }

  const RESOURCE_ID_BY_BRIDGE = {
    home: parsedResourceIds[homeChainId],
    foreign: parsedResourceIds[foreignChainId],
  }

  return { ENVIRONMENT, ACCESS_ID, RESOURCE_ID_BY_BRIDGE }
}

const schemas = [
  ...new Set(
    Object.entries(subgraphEndpoints).reduce((acc, [chainPair, bridgeSides]) => {
      const { ACCESS_ID, ENVIRONMENT, RESOURCE_ID_BY_BRIDGE } = getSubgraphEnvVariables(chainPair)

      return [
        ...acc,
        ...Object.entries(bridgeSides).map(([bridgeSide, environments]) => {
          return environments[ENVIRONMENT].replace('{{accessId}}', ACCESS_ID).replace(
            '{{resourceId}}',
            RESOURCE_ID_BY_BRIDGE[bridgeSide],
          )
        }),
      ]
    }, []),
  ),
]

// Log schemas with masked ACCESS_ID
console.log(
  'schemas',
  schemas.map((url) => url.replace(/[a-zA-Z0-9-]+(?=\/subgraphs\/id)/, '[SUBGRAPH_ACCESS_ID]')),
)

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
