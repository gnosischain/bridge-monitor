# Readme

Subgraph repository for the Bridges Monitoring System for the XDAI and Omnibridge Bridges.

A Bridge is deployed in two networks called Home (GnosisChain) and Foreign (Mainnet), or their respectives testnets.
As a Subgraph can only listen to events from a specific network, we will use the subgraph template files as following:
- subgraph-home.template: track events from home network
- subgraph-foreign.template: track events from foreign network

ATTENTION: Each Subgraph must be deployed separately!

Current Contracts:
- HomeBridgeErcToNative (GnosisChain)
- ForeignBridgeErcToNative (Mainnet)

## XDAI Bridge Information

See [XDAI Bridge](./XDAI_BRIDGE.md)

## AMB Bridge Information

See [AMB Bridge](./AMB_BRIDGE.md)

## How to use

Copy Env vars
- cp .env.example .env

Install dependencies
- yarn install

Generate Types
- yarn codegen

Deploy (Remember to edit ACCESS_TOKEN and SUBGRAPH_NAME env vars)
- yarn deploy
