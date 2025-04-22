#!/bin/bash
set -e

source "./scripts/env.sh"

# # @TODO we might reuse the generated files only removing when TYPE is diff from previous
# if [ -d "generated" ]; then
#   echo "Cleaning generated types"
#   rm -r generated/
# fi

VALIDATORS_TYPES_CONFIG="./src/config/validators.template"
VALIDATORS_TYPES_OUTPUT="./src/config/validators.ts"
# Build subgraph.yaml
if [ -f $VALIDATORS_TYPES_CONFIG ]; then
  echo "Generating validators type"
  mustache $CONFIG_FILE $VALIDATORS_TYPES_CONFIG > $VALIDATORS_TYPES_OUTPUT
fi

ADDRESSES_CONFIG="./src/config/addresses.template"
ADDRESSES_OUTPUT="./src/config/addresses.ts"
# Build subgraph.yaml
if [ -f $ADDRESSES_CONFIG ]; then
  echo "Generating addresses types"
  mustache $CONFIG_FILE $ADDRESSES_CONFIG > $ADDRESSES_OUTPUT
fi

mustache $CONFIG_FILE $SUBGRAPH_TEMPLATE > subgraph.yaml

# Run codegen to generate Types
graph codegen