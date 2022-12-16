// eslint-disable-next-line @typescript-eslint/no-var-requires
const dotenv = require("dotenv")
dotenv.config()

const codeGenOutDir = 'src/types/subgraph/subgraph.ts'

const FOREIGN_ENDPOINT = process.env.SUBGRAPH_API_FOREIGN || ''
const NATIVE_ENDPOINT = process.env.SUBGRAPH_API_NATIVE || ''
const schemas = [NATIVE_ENDPOINT, FOREIGN_ENDPOINT]

module.exports = {
  overwrite: true,
  schema: schemas,
  documents: 'src/queries/**/*.ts',
  generates: {
    [codeGenOutDir]: {
      plugins: [
        'typescript',
        'typescript-operations',
        'typescript-graphql-request'
      ],
    },
  },
  config: {
    rawRequest: false,
    autogenSWRKey: true,
  },
}
