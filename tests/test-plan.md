# Bridge Monitor Test Plan

**Table of Contents**

[TOCM]

[TOC]

## Introduction

### Purpose of the test plan
The Gnosis Chain OmniBridge is a multi-chain bridge solution that allows for the transfer of assets between different blockchains. Within the OmniBridge, there are different types of bridges that can be used to transfer assets between specific blockchains. 
This document defines the goals of the testing process, such as verifying the contract's ability to transfer assets between two blockchains. All the resources and process has to be traceable and the info shown in the app must be reliable.

### Overview of the software application or system being tested
https://bridge-explorer.staging.gnosisdev.com/

## Test Strategy

### Test environment and configurations
Within the OmniBridge, there are different types of bridges that can be used to transfer assets between specific blockchains. 
Here are some of the types of bridges available in the Gnosis Chain OmniBridge:
#### Native:
http://bridge.gnosischain.com/
##### Test bridge from ETH-> GC

##### Test bridge from GC->ETH


#### AMB: 
https://docs.gnosischain.com/bridges/tokenbridge/omnibridge/
##### Test bridge from ETH-> GC

##### Test bridge from GC->ETH

### Assumptions and dependencies
The project consists in three main subdirectories which are:
- alerts
- app (node version 14.17.0)
- subgraph (node version v18.9.0)
To run a functional deployment the following workflow has to be followed:
1. Subgraph dir: Create subgraph definitions of manifests trhough the templates (subgraph-foreign.template.yaml, subgraph-home.template.yaml).
Define .env file with the network configurations.
Install project dependecies and run the build commands (package.json).
Save the subgraph's addresses to set in the next step
2.  App dir: The app consists in a node.js react app that was developed using [next.js](http://https://nextjs.org/learn/basics/create-nextjs-app) as framework.
Set the subgraph's adresses on `app/src/constants/config/subgraph-endpoints.json`
Set .env file variables with different network, monitoring and style configs.
Install modules dependencies and execute build command which execute the scripts defined (package.json).

There is also a dockerfile that automates the build stage of the node.js app

The following bullet points represents the main configurations to take into account:
- Dependant of node version for the build process.
- Several deprecations on dependencies and node modules
- ESlint errors for unused code and syntax or variable definition errors.
- Framework configuration and typescript syntax.

### Functional test strategy

Prepare deposit transactions within the bridges (native & AMB) and execute for each posible network combination. (as describe above)
Test for edge cases and possible failure scenarios. This could include testing for insufficient gas, network congestion, or other issues that could impact the performance of the Ethereum bridge.

### Test Schedule

During the build process through the github actions pipeline to create new releases.

### Resource allocation

For the current version the app at least needs a server that runs the node's engine or has next.js integrations as platforms such as [vercel](https://vercel.com/ "vercel")

## Test Cases

## Test case prerequisites and steps

## Expected results and pass/fail criteria
The success of the tests is considered when all the TX's info and traceability are defined and matched with the different block explorers for the various networks that are linked with the models shown in the app.

It also refers with the status of failed TXs and the info associated with it (Pending, Replaced, Failed, Mined, etc). The info should be streamed updated and reliable to be considered a source of truth.

## Current erros

Loading TXs table returns:
```bash
 Failed to decode `Bytes` value: `Odd number of digits`: {"response":{"errors":[{"message":"Failed to decode `Bytes` value: `Odd number of digits`"}],"status":200,"headers":{"map":{"content-type":"application/json"}}},"request":{"query":"fragment TransactionFragment on Transaction {\n  id\n  bridgeName\n  transactionHash\n  initiator\n  initiatorAmount\n  initiatorNetwork\n  receiver\n  receiverAmount\n  receiverNetwork\n  transactionStatus\n  timestamp\n  execution {\n    id\n    timestamp\n    transactionHash\n    responsableAddress\n  }\n  validations {\n    id\n    timestamp\n    transactionHash\n    responsableAddress\n  }\n}\n\nquery Transactions($where: Transaction_filter, $orderBy: Transaction_orderBy, $orderDirection: OrderDirection, $first: Int, $skip: Int) {\n  transactions(\n    where: $where\n    orderBy: $orderBy\n    orderDirection: $orderDirection\n    first: $first\n    skip: $skip\n  ) {\n    ...TransactionFragment\n  }\n}","variables":{"orderBy":"timestamp","orderDirection":"desc","first":500,"skip":0,"where":{"bridgeName_not":null,"transactionHash":"0x1ee6145c90000c15d5b93b28a66576fd33cffed3e6f387b0c34f529c7f68372f7","bridgeName_contains_nocase":"XDAI","timestamp_gte":1680386400,"timestamp_lte":1680516089}}}}
```

## Defect tracking and reporting process

https://www.notion.so/Bridge-Explorer-Tests-and-Bugs-da38e4b6b6154322be33c21a09321e6d

### Severity and priority levels
### Resolution and retesting procedures
### Potential risks to the testing process and software release
## Conclusion
Summary of the test plan
