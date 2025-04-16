#!/bin/bash
set -e

source "./scripts/build.sh"

if [ -z $SUBGRAPH_NAME ]; then echo "No Subgraph Name Environment Variable!"; exit 1; fi
if [ -z $DEPLOY_API_KEY ]; then echo "No DEPLOY_API_KEY Environment Variable!"; exit 1; fi
if [ -z $SUBGRAPH_LABELS ]; then echo "No SUBGRAPH_LABELS Environment Variable!"; exit 1; fi

graph auth $DEPLOY_API_KEY

# @TODO deploying directly to $SUBGRAPH_NAME is prone to errors
# @TODO use GRAPH_ADMIN_NODE_ENDPOINT var to deploy multiple envs (local, etc)
echo "Deploying to $SUBGRAPH_NAME"
graph deploy $SUBGRAPH_NAME -l $SUBGRAPH_LABELS

# @TODO we might reuse subgraph.yaml only removing when TYPE is diff from previous
GENERATED_FILE="subgraph.yaml"
if [[ $DEBUG = false && -f $GENERATED_FILE ]]; then
  echo "Cleaning generated file"
  rm $GENERATED_FILE
fi