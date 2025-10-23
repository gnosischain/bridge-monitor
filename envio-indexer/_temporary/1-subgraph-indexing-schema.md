### Bridge Monitor Subgraph: Indexed Contracts, Events, and Entity Writes

This document summarizes the subgraph under `subgraph/`: contracts and events indexed on each chain, and the entities/fields written.

- **Chains covered**:
  - Foreign: `mainnet`
  - Home: `gnosis`
- **Primary bridge types**: `XDAI` (xDai ERC-to-Native bridge) and `AMB` (Arbitrary Message Bridge / OmniBridge mediators)

### Entities (from `schema.graphql`)
- **Validator**: `id = <validatorAddress>-<BridgeType>`
  - Fields: `address`, `name`, `bridgeType`, `lastActivity`, `hashAdded`, `hashRemoved`, `removed`
  - Derived: `signed: [TransactionValidation]`, `executed: [TransactionExecution]`
- **TransactionValidation**: `id = <txHash>` or `<messageId>-<validatorId>`
  - Fields: `transaction` (ref to Transaction), `transactionHash`, `validator`, `validatorAddr`, `timestamp`
- **TransactionExecution**: `id = <txId>` or `<messageId>-<executor>`
  - Fields: `transaction` (ref), `transactionHash`, `timestamp`, `executor` (Validator), `validatorAddr`
- **XDAITransaction implements Transaction**
  - `id` varies by flow: `txHash` or `combineNonceAndChainId(nonce, chainId)`
  - Core fields: `messageId`, `transactionHash`, `timestamp`, `bridgeName`, `transactionStatus`
  - Initiator: `initiator`, `initiatorNetwork`, `initiatorAmount`, `initiatorToken`
  - Receiver: `receiver`, `receiverNetwork`, `receiverAmount`, `receiverToken`
  - Additional: `nonce` (when present), `validations`, `execution`
- **AMBTransaction implements Transaction**
  - `id = messageId` (hex string)
  - Same Transaction core + initiator/receiver fields as above; `validations`, `execution`

---

## Foreign chain (ethereum)

### DAI (`DAI.json`) — file: `src/foreign-xdai.ts`
- Event: `Transfer(indexed address src, indexed address dst, uint256 wad)` → `handlerTransfer`
- Filters/logic:
  - Only when `dst` is the xDai bridge contract (`FOREIGN_BRIDGE_ERC_TO_NATIVE_ADDRESS`)
  - Ignore mints (`src == 0x0`)
  - Ignore after upgrade block `22273407`
- Writes:
  - Create `XDAITransaction` with `id = txHash`
  - Set: `transactionHash`, `bridgeName = "XDAI"`, `transactionStatus = INITIATED`, `timestamp`
  - Initiator: `initiator = src`, `initiatorToken = DAI`, `initiatorAmount = wad`, `initiatorNetwork = dataSource.network()`
  - Attempt to enrich from receipt via `processUserRequestForAffirmation`; if no receiver inferred, set `receiver = src`
  - Receiver: `receiverAmount = wad`, `receiverNetwork = "gnosis"`, `receiverToken = Address.zero()`

### ForeignBridgeErcToNative (`ForeignBridgeErcToNative.json`) — file: `src/foreign-xdai.ts`
- Event: `UserRequestForAffirmation(address recipient, uint256 value, bytes32 nonce)` → `handlerUserRequestForAffirmationWithNonce`
  - Only after upgrade block `>= 22273407`
  - Extract `sender` and `initiatorToken` from `Transfer` logs in the receipt when destination matches bridge/peripheral/router
  - Compute `id = combineNonceAndChainId(nonce, 1)`; also persisted in `messageId`
  - Writes `XDAITransaction` with INITIATED status, initiator/receiver details (receiver = `recipient`, token = zero on receiver side), `nonce`
- Event: `RelayedMessage(address recipient, uint256 value, bytes32 txHashOrNonce)` → `handlerRelayedMessage`
  - If `txHashOrNonce` looks like a nonce (starts with zeroes), transform with `combineNonceAndChainId(..., 100)` and use that as `id`
  - Writes `TransactionExecution` with `id = txId`, links `transaction`, sets `transactionHash`, `timestamp`
  - Upserts `XDAITransaction` to `COMPLETED`, sets `messageId`, `initiatorNetwork = "gnosis"`, `initiatorToken = 0x0`, `initiatorAmount = value`, receiver details on foreign (`receiverToken = DAI`, `receiverNetwork = dataSource.network()`, `receiverAmount = value`), and links `execution`

### ForeignAMB (`ForeignAMB.json`) — file: `src/foreign-amb.ts`
- Event: `UserRequestForAffirmation(indexed bytes32 messageId, bytes encodedData)` → `handlerUserRequestForAffirmation`
  - Filters OmniBridge usage by inspecting `encodedData`
  - Creates `AMBTransaction` with `id = messageId`, INITIATED status
  - Initiator: network = `dataSource.network()`, rest parsed via `processOmniBridgeTokenBridgingInitiatedEvent(receipt, messageId)`
  - Receiver: address parsed from `encodedData` (bytes 260–300), mirrors initiator `amount` and `token`, `receiverNetwork = "gnosis"`
- Event: `RelayedMessage(indexed address sender, indexed address executor, indexed bytes32 messageId, bool status)` → `handlerRelayedMessage`
  - Validates known OmniBridge mediator pair via `isOmniBridgeKnownMediator(sender, executor)`
  - Creates `TransactionExecution` with `id = messageId + '-' + sender` (sender is home mediator), links to `messageId`
  - Upserts `AMBTransaction` to `COMPLETED` or `ERROR`, sets directions (`initiatorNetwork = "gnosis"`, `receiverNetwork = dataSource.network()`), and parses bridged tokens via `processOmniBridgeTokensBridged(receipt)`

---

## Home chain (gnosis)

### HomeBridgeErcToNative (`HomeBridgeErcToNative.json`) — file: `src/home-xdai.ts`
- Event: `UserRequestForSignature(address recipient, uint256 value)` → `handlerUserRequestForSignature`
  - Creates `XDAITransaction` with `id = txHash`, `messageId = txHash`, INITIATED
  - Initiator: from `event.transaction.from`, network = `gnosis`, token = `0x0`, amount = `value`
  - Receiver: address = `recipient`, network = `mainnet`, token = `DAI`, amount = `value`
- Event: `UserRequestForSignature(address recipient, uint256 value, bytes32 nonce)` → `handlerUserRequestForSignatureWithNonce`
  - `id = combineNonceAndChainId(nonce, 100)`, `messageId` set to that value; same initiator/receiver filling as above; INITIATED
- Event: `SignedForUserRequest(indexed address signer, bytes32 messageHash)` → `handlerSignedForUserRequest`
  - Resolves tx id by calling `HomeBridgeErcToNative.message(messageHash)` and decoding via `getHomeNonceOrTxHashFromMessageMethod`
  - When nonce-like id, convert with `combineNonceAndChainId(..., 100)`
  - Updates `XDAITransaction.transactionStatus = COLLECTING`
  - Loads `Validator` via config (`loadValidator`), updates `lastActivity`
  - Creates `TransactionValidation` with `id = txHash`, sets `validator`, `validatorAddr`, `transaction`, `transactionHash`, `timestamp`
- Event: `CollectedSignatures(address authorityResponsibleForRelay, bytes32 messageHash, uint256 count)` → `handlerCollectedSignatures`
  - Resolves tx id as above
  - Updates `XDAITransaction.transactionStatus = UNCLAIMED`
- Event: `SignedForAffirmation(indexed address signer, bytes32 nonce)` → `handlerSignedForAffirmation`
  - Computes `id` from `nonce` (chain 1 if needed)
  - If missing, creates `XDAITransaction` with `COLLECTING`, fills initiator/receiver from `xDAISignedForAffirmationData(tx, transactionData)`
  - Loads `Validator`, updates `lastActivity`
  - Creates `TransactionValidation` with `id = <nonce>-<validator>`
- Event: `AffirmationCompleted(address sender, uint256 nonce, bytes32 txHashOrNonce)` → `handlerAffirmationCompleted`
  - Computes `id` from `nonce` (chain 1 if needed)
  - Loads `Validator` from `event.transaction.from`, updates `lastActivity`
  - Creates `TransactionExecution` with `id = nonce`, sets `executor`, `validatorAddr`, `transaction`, `transactionHash`, `timestamp`
  - Updates `XDAITransaction.transactionStatus = COMPLETED`, links `execution`

### XDAIBridgeValidators (`BridgeValidators.json`) — file: `src/bridge-validators/xdai-validators.ts`
- Events:
  - `ValidatorAdded(indexed address validator)` → `_handlerValidatorAdded`
  - `ValidatorRemoved(indexed address validator)` → `_handlerValidatorRemoved`
- Writes (`src/bridge-validators/bridge-validators.ts`):
  - Added: create `Validator` with `id = <address>-XDAI`, set `address`, `name` (from config), `bridgeType = XDAI`, `removed = false`, `hashAdded`
  - Removed: load `Validator` by id and set `removed = true`, `hashRemoved`

### AMBBridgeValidators (`BridgeValidators.json`) — file: `src/bridge-validators/amb-validators.ts`
- Events and writes are the same as above but with `bridgeType = AMB` and ids `'<address>-AMB'`

### HomeAMB (`HomeAMB.json`) — file: `src/home-amb.ts`
- Event: `UserRequestForSignature(indexed bytes32 messageId, bytes encodedData)` → `handlerUserRequestForSignature`
  - Filters OmniBridge usage, creates `AMBTransaction` with `id = messageId`, INITIATED
  - Initiator: network = `dataSource.network()`, parsed via `processOmniBridgeTokenBridgingInitiatedEvent`
  - Receiver: parsed from `encodedData` (bytes 260–300); `receiverNetwork = "mainnet"` if encodedData contains the known mainnet home mediator
- Event: `SignedForUserRequest(indexed address signer, bytes32 messageHash)` → `handlerSignedForUserRequest`
  - Loads `AMBTransaction` by `messageId` decoded from `HomeAMB.message(messageHash)`; sets `COLLECTING`
  - Loads/updates `Validator.lastActivity`
  - Creates `TransactionValidation` with `id = <messageId>-<validator>`
- Event: `CollectedSignatures(address authorityResponsibleForRelay, bytes32 messageHash, uint256 count)` → `handlerCollectedSignatures`
  - Loads `AMBTransaction`, sets `UNCLAIMED`
  - Loads `Validator` for executor, creates `TransactionExecution` with `id = <messageId>-<executor>` and links to transaction
- Event: `SignedForAffirmation(indexed address signer, bytes32 messageId)` → `handlerSignedForAffirmation`
  - Filters OmniBridge-only affirmations
  - Determines `messageId` from tx data (Telepathy-specific path supported)
  - Upserts `AMBTransaction` to `COLLECTING` if not present
  - Loads/updates `Validator`, creates `TransactionValidation` with `id = txHash`
- Event: `AffirmationCompleted(indexed address sender, indexed address executor, indexed bytes32 messageId, bool status)` → `handlerAffirmationCompleted`
  - Validates mediator pair, creates `TransactionExecution` with `id = <messageId>-<executor>`; if available, backfills `executor/validatorAddr` from last `TransactionValidation`
  - Loads `AMBTransaction`, sets `COMPLETED`, links `execution`, parses final bridged token/amount via `processOmniBridgeTokensBridged(receipt)`

---

## ID strategies and cross-chain correlation
- XDAI side uses two initiation modes; ids are either:
  - `txHash` (pre-nonce flows or direct DAI -> bridge transfer), or
  - `combineNonceAndChainId(nonce, chainId)` where chainId is `1` (foreign) or `100` (home)
- AMB side uses `messageId` as the canonical id across both chains.
- Executions often use compound ids (`<messageId>-<executor>` or `<messageId>-<homeMediator>`) to preserve uniqueness.

## Status transitions
- INITIATED → COLLECTING → UNCLAIMED → COMPLETED/ERROR
- Transitions are driven by signature collection and completion events as outlined above.

## Validator lifecycle
- When added/removed on either validator set contract, Validator entities are created/updated with provenance (`hashAdded/hashRemoved`).
- During signature/affirmation events, `lastActivity` is updated.

## Notes
- OmniBridge parsing relies on transaction receipts; handlers exit early if `receipt` is absent.
- Address and mediator filters ensure only ERC20 bridge flows are indexed.
- Some receiver fields for xDai ERC-to-Native (foreign side) default to `initiator` when the affirmation event is not emitted (direct DAI → bridge transfers).
