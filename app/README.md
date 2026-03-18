# bridge-monitor

## How to build

from within this folder run

- COMPOSE_DOCKER_CLI_BUILD=1 DOCKER_BUILDKIT=1 docker-compose build

- docker-compose up

http://localhost:3000

## Adding New Validators

### Fetching Validators Info
Validators are fetched from each Bridge Validator Contract

- XDAI [0xb289f0e6fbdff8eee340498a56e1787b303f1b6d](https://gnosisscan.io/address/0xb289f0e6fbdff8eee340498a56e1787b303f1b6d)
- AMB [0xa280fed8d7cad9a76c8b50ca5c33c2534ffa5008](https://gnosisscan.io/address/0xa280fed8d7cad9a76c8b50ca5c33c2534ffa5008)

If Bridges Validator Contracts change, their addresses must be updated at `subgraph/config/`
- `gnosis.json` for Home Events
- `mainnet.json` for Foreign Events

For the subgraphs to listen ValidatorAdded` and `ValidatorRemoved` events

### Registering new Validator for Transaction Info
Before a Validator is added to Bridge Validator Contract, they must be registered within the subgraph config files.
This will let Transaction Validation listeners have all required information and keep track of Validators' activity within the TXs. 

### Displaying Validator
For the Explorer to render their information and list them, validators must be registered at:

`app/src/utils/validators/xdai.json` for XDAI
`app/src/utils/validators/amb.json` for AMB/OMNI

Object should be registered containing
- a custom ID
- its ADDRESS
- its NAME
- its BRIDGE TYPE
- a SHORTNAME

> e.g. when adding Gateway Validator

- `app/src/utils/validators/xdai.json`
```
  ...
  {
    "id": 8,
    "address": "0x90776017057b84bc47D7e7383b65C463C80a6cdd",
    "name": "Gateway",
    "bridgeType": "XDAI",
    "shortName": "GW",
    "status": "default"
  }
```

- `app/src/utils/validators/amb.json`
```
  ...
  {
    "id": 8,
    "address": "0x3e0a20099626f3d4d4ea7b0ce0330e88d1fe65d6",
    "name": "Gateway",
    "bridgeType": "AMB",
    "shortName": "GW",
    "status": "default"
  }
```
