// eslint-disable-next-line @typescript-eslint/no-var-requires
const dotenv = require("dotenv");

// Note: This file is not needed for Envio. This is for reference purpose only

const codeGenOutDir = "src/types/subgraph/subgraph.ts";

const FOREIGN_ENDPOINT = process.env.SUBGRAPH_API_FOREIGN || "";
const NATIVE_ENDPOINT = process.env.SUBGRAPH_API_NATIVE || "";
const schemas = [
  {
    [NATIVE_ENDPOINT]
  },
  {
    [FOREIGN_ENDPOINT]
  },
];

module.exports = {
  overwrite: true,
  schema: schemas,
  documents: "src/queries/**/*.ts",
  generates: {
    [codeGenOutDir]: {
      plugins: [
        "typescript",
        "typescript-operations",
        "typescript-graphql-request",
      ],
    },
  },
  config: {
    rawRequest: false,
    autogenSWRKey: true,
  },
};
