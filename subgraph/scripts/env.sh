#!/usr/bin/env bash

# Exit script as soon as a command fails.
set -o errexit

# Exporting variables from the env file and making them available in the code below
set -a

if [ -f .env ]; then
  echo "Loading .env file"
  source .env
fi

set +a

# Type is required to Generate Specific subgraph.yaml
if [ -z $TYPE ]; then echo "No Type Environment Variable!"; exit 1; fi
if [ -z $NETWORK ]; then echo "No Network Environment Variable!"; exit 1; fi

# Generates files from templates
SUBGRAPH_TEMPLATE=subgraph-$TYPE.template.yaml
CONFIG_FILE=config/$NETWORK.json

if [ ! -f "$CONFIG_FILE" ]; then echo "Config $CONFIG_FILE file does not exist."; exit 1; fi
if [ ! -f "$SUBGRAPH_TEMPLATE" ]; then echo "Template $SUBGRAPH_TEMPLATE file does not exist."; exit 1; fi