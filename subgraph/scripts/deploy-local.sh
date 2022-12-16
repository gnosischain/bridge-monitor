#!/bin/bash
set -e

source "./scripts/build.sh"

if [ -z $SUBGRAPH_NAME ]; then echo "No Subgraph Name Environment Variable!"; exit 1; fi

# Create Graph in Local Environment
IPFS_NODE="http://localhost:5001"
GRAPH_NODE="http://localhost:8020"

# @TODO generate it automagically
SUBGRAPH_VERSION="0.0.1"

# @TODO use GRAPH_ADMIN_NODE_ENDPOINT var to deploy multiple envs (local, etc)
echo "Creating $SUBGRAPH_NAME"
graph create $SUBGRAPH_NAME --node $GRAPH_NODE

# Deploy Graph
echo "Deploying $SUBGRAPH_NAME"
graph deploy $SUBGRAPH_NAME --ipfs $IPFS_NODE --node $GRAPH_NODE --version-label $SUBGRAPH_VERSION

# @TODO we might reuse subgraph.yaml only removing when TYPE is diff from previous
GENERATED_FILE="subgraph.yaml"
if [[ $DEBUG = false && -f $GENERATED_FILE ]]; then
  echo "Cleaning generated file"
  rm $GENERATED_FILE
fi
