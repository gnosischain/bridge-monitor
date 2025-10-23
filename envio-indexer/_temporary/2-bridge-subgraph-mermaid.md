### Bridge Monitor Subgraph: Mermaid Diagram

```mermaid
graph LR
  %% Layout
  classDef entity fill:#eef,stroke:#66f,stroke-width:1px;
  classDef contract fill:#efe,stroke:#494,stroke-width:1px;
  classDef validator fill:#ffe,stroke:#aa4,stroke-width:1px;

  %% Foreign contracts
  subgraph FOREIGN["Foreign (ethereum)"]
    DAI[DAI]:::contract
    FBR[ForeignBridgeErcToNative]:::contract
    FAMB[ForeignAMB]:::contract

    %% Foreign events (separate boxes)
    DAI_Transfer[Transfer]
    FBR_UserReqAff[UserRequestForAffirmation]
    FBR_Relayed[RelayedMessage]
    FAMB_UserReqAff[UserRequestForAffirmation]
    FAMB_Relayed[RelayedMessage]

    %% Connect contracts to events
    DAI -- emits --> DAI_Transfer
    FBR -- emits --> FBR_UserReqAff
    FBR -- emits --> FBR_Relayed
    FAMB -- emits --> FAMB_UserReqAff
    FAMB -- emits --> FAMB_Relayed
  end

  %% Home contracts
  subgraph HOME["Home (gnosis)"]
    HBR[HomeBridgeErcToNative]:::contract
    HAMB[HomeAMB]:::contract

    %% Home events (separate boxes)
    HBR_UserReqSig[UserRequestForSignature]
    HBR_UserReqSigNonce[UserRequestForSignatureWithNonce]
    HBR_SignedReq[SignedForUserRequest]
    HBR_Collected[CollectedSignatures]
    HBR_SignedAff[SignedForAffirmation]
    HBR_AffCompleted[AffirmationCompleted]

    HAMB_UserReqSig[UserRequestForSignature]
    HAMB_SignedReq[SignedForUserRequest]
    HAMB_Collected[CollectedSignatures]
    HAMB_SignedAff[SignedForAffirmation]
    HAMB_AffCompleted[AffirmationCompleted]

    %% Connect contracts to events
    HBR -- emits --> HBR_UserReqSig
    HBR -- emits --> HBR_UserReqSigNonce
    HBR -- emits --> HBR_SignedReq
    HBR -- emits --> HBR_Collected
    HBR -- emits --> HBR_SignedAff
    HBR -- emits --> HBR_AffCompleted

    HAMB -- emits --> HAMB_UserReqSig
    HAMB -- emits --> HAMB_SignedReq
    HAMB -- emits --> HAMB_Collected
    HAMB -- emits --> HAMB_SignedAff
    HAMB -- emits --> HAMB_AffCompleted
  end

  %% Entities
  XTX[(XDAITransaction)]:::entity
  ATX[(AMBTransaction)]:::entity
  TV[(TransactionValidation)]:::entity
  TE[(TransactionExecution)]:::entity
  VAL[(Validator)]:::entity

  %% Foreign event -> entity writes
  DAI_Transfer -- writes --> XTX
  FBR_UserReqAff -- writes --> XTX
  FBR_Relayed -- writes --> TE
  FBR_Relayed -- updates --> XTX
  FAMB_UserReqAff -- writes --> ATX
  FAMB_Relayed -- writes --> TE
  FAMB_Relayed -- updates --> ATX

  %% Home event -> entity writes
  HBR_UserReqSig -- writes --> XTX
  HBR_UserReqSigNonce -- writes --> XTX
  HBR_SignedReq -- writes --> TV
  HBR_SignedReq -- updates --> XTX
  HBR_SignedReq -- updates_lastActivity --> VAL
  HBR_Collected -- updates --> XTX
  HBR_SignedAff -- writes --> TV
  HBR_SignedAff -- may_create_or_update --> XTX
  HBR_SignedAff -- updates_lastActivity --> VAL
  HBR_AffCompleted -- writes --> TE
  HBR_AffCompleted -- updates --> XTX
  HBR_AffCompleted -- updates_lastActivity --> VAL

  HAMB_UserReqSig -- writes --> ATX
  HAMB_SignedReq -- writes --> TV
  HAMB_SignedReq -- updates --> ATX
  HAMB_SignedReq -- updates_lastActivity --> VAL
  HAMB_Collected -- writes --> TE
  HAMB_Collected -- updates --> ATX
  HAMB_SignedAff -- writes --> TV
  HAMB_SignedAff -- may_create_or_update --> ATX
  HAMB_AffCompleted -- writes --> TE
  HAMB_AffCompleted -- updates --> ATX

  %% Relationships (dotted) from TV/TE to their parent transactions
  TV -. references .-> XTX
  TV -. references .-> ATX
  TE -. references .-> XTX
  TE -. references .-> ATX
  %% Relationships (dotted) from TV/TE to Validator
  TV -. references .-> VAL
  TE -. may_reference .-> VAL
```

Notes:
- Some XDAITransaction ids are `txHash` (pre-nonce flows) or `combineNonceAndChainId(nonce, chainId)`; AMBTransaction ids are `messageId`.
- TransactionExecution and TransactionValidation link back to the relevant transaction by id; Validator `lastActivity` is updated on signature/affirmation events.

### Validator Lifecycle (focused)

```mermaid
flowchart TB
  classDef entity fill:#eef,stroke:#66f,stroke-width:1px;
  classDef contract fill:#efe,stroke:#494,stroke-width:1px;
  classDef validator fill:#ffe,stroke:#aa4,stroke-width:1px;

  subgraph GNOSIS["Home (gnosis)"]
    XVAL[XDAIBridgeValidators]:::contract
    AVAL[AMBBridgeValidators]:::contract
    HBR[HomeBridgeErcToNative]:::contract
    HAMB[HomeAMB]:::contract

    %% Validator set events
    VADD_X[ValidatorAdded]
    VREM_X[ValidatorRemoved]
    VADD_A[ValidatorAdded]
    VREM_A[ValidatorRemoved]

    %% Signature / affirmation events that touch validators
    HBR_SIG_REQ[SignedForUserRequest]
    HBR_SIG_AFF[SignedForAffirmation]
    HBR_AFF_DONE[AffirmationCompleted]

    HAMB_SIG_REQ[SignedForUserRequest]
    HAMB_COLLECTED[CollectedSignatures]

    %% Contract -> event
    XVAL -- emits --> VADD_X
    XVAL -- emits --> VREM_X
    AVAL -- emits --> VADD_A
    AVAL -- emits --> VREM_A

    HBR -- emits --> HBR_SIG_REQ
    HBR -- emits --> HBR_SIG_AFF
    HBR -- emits --> HBR_AFF_DONE

    HAMB -- emits --> HAMB_SIG_REQ
    HAMB -- emits --> HAMB_COLLECTED
  end

  %% Entities
  VAL[(Validator)]:::entity
  TV[(TransactionValidation)]:::entity
  TE[(TransactionExecution)]:::entity

  %% Validator set writes
  VADD_X -- writes --> VAL
  VREM_X -- updates --> VAL
  VADD_A -- writes --> VAL
  VREM_A -- updates --> VAL

  %% Validator activity updates
  HBR_SIG_REQ -- writes --> TV
  HBR_SIG_REQ -- updates_lastActivity --> VAL
  HBR_SIG_AFF -- writes --> TV
  HBR_SIG_AFF -- updates_lastActivity --> VAL
  HBR_AFF_DONE -- writes --> TE
  HBR_AFF_DONE -- updates_lastActivity --> VAL

  HAMB_SIG_REQ -- writes --> TV
  HAMB_SIG_REQ -- updates_lastActivity --> VAL
  HAMB_COLLECTED -- writes --> TE

  %% Cross-entity references
  TV -. references .-> VAL
  TE -. may_reference .-> VAL
```

