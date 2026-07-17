# Bridge Monitor - Full `/app` Regression QA

Full regression for the entire `/app` bridge explorer - the **read-only** surfaces (limits,
balances, token info, dropdowns, validators) **and** the **write path** (approve, bridge, swap,
claim).

Run this **before any release / promotion** (`develop` -> `staging` -> `main`) and **after any
significant refactor** that touches the read hooks, the write flows, wallet/network handling, or the
bridge/chain config.

The golden rule for every check: **the build under test must behave exactly like the last
known-good release.** When a value or behavior is unclear, open the same screen on the reference
build (prod / `main`) side by side and compare.

- Build under test: the branch / preview being validated - run locally (`pnpm app:dev` ->
  http://localhost:3000) or a preview deploy.
- Reference (baseline): the current **production** build, or `main` / `staging`.
- Cross-check on-chain numbers against https://gnosisscan.io and https://etherscan.io.

---

## How to use this document

1. Check out / deploy the build under test.
2. Do the **read-only pass first** (screens marked 🔵 - no funds), then the **write pass**
   (screens marked 🟠 - needs a funded test wallet). This front-loads everything you can verify
   without spending.
3. Work **screen by screen** (sections below). Each item is a checkbox - tick it when the observed
   behavior matches the expectation.
4. For any **numeric** surface, fill the **Cross-check** tables with observed vs reference and mark
   Pass/Fail.
5. Keep the **browser console open** the whole time. A provider/RPC error or `undefined is not a
   function` is the usual signature of a broken read/write path - note it.
6. Record the build and tester in the **Sign-off** section at the bottom.

### Legend

- 🔵 **read-only** - no funds, works even unconnected (wallet only needed to see real balances).
- 🟠 **write** - needs a connected test wallet with **small** real funds on the relevant chain(s).

### Funds / preconditions for the write pass

Networks are **mainnet only** (Ethereum chain 1 + Gnosis chain 100) - write QA moves **real
funds**. Use a dedicated test wallet with small amounts:

- Gas on **both** chains (ETH on mainnet, xDAI on Gnosis).
- **xDAI** (Gnosis) for the native bridge; **DAI** and **USDS** on **both** chains.
- **USDC**, **USDT** on both chains; **USDC.e** on Gnosis (for the Swap & Bridge path).
- A **claimable** foreign->home tx awaiting claim (for the ClaimButton checks) - or start one and
  wait for it to become claimable.

---

## Coverage map

| Surface under test | Screen(s) | Pass |
|--------------------|-----------|------|
| `isAddress` / tx-hash validation (strict checksum) | sidebar search, latest-tx filter, both token dropdowns | |
| Bridge confirmation polling | `/bridge/[tx]` | |
| Wallet token balances + MAX | `/` | |
| Daily bridge limits | `/bridge-explorer/bridges` | |
| Bridge limits (min/max/remaining + validation) | `/` | |
| "You receive" / destination token info | `/` | |
| TokenDropdown on-chain custom-token lookup | `/`, `/bridge-explorer/bridges` | |
| Validator balances | `/bridge-explorer/validators` | |
| Transaction notification toasts | *cross-cutting - every write* | |
| Approve (allowance) write path | `/` Approve, `/usdc` Approve | |
| USDC transmuter swap | `/usdc` | |
| Claim (foreign->home) | latest-transactions, transaction/[tx] | |
| Bridge write - all token/direction handler branches | `/` (incl. Swap & Bridge modal) | |

---

## Cross-cutting behaviors (test once, then reference from each write flow)

These are the same everywhere and are where semantics matter most - do them carefully once and
re-confirm they hold in each write flow.

### Wallet connection / network

- [ ] 🔵 Load `/` **unconnected** - the button reads **"Connect Wallet"**; read-only surfaces
      (limits, token-out, dropdowns) still render.
- [ ] 🟠 Connect the test wallet - address/balances appear.
- [ ] 🟠 With the wallet on the **wrong chain** for the selected direction, the primary button
      becomes **"Switch to <network>"**; clicking it prompts the network switch.
- [ ] 🟠 Disconnect mid-session - UI returns to the unconnected state without console errors.

### Transaction notification toasts

Exercised by **every** write (approve / bridge / swap / claim). For the first write you do:

- [ ] 🟠 On submit, a **"waiting for signature"** toast appears; after confirming, it goes
      **pending -> confirmed** with a **working block-explorer link** (correct chain).
- [ ] 🟠 **Reject** the tx in the wallet -> a **"User denied signature"** / cancelled toast; the
      button recovers (no stuck "Approving…/Bridging…/Claiming…" placeholder).
- [ ] 🟠 If any write **reverts** on-chain -> it surfaces as a **failure** toast (it must **not**
      silently show success) and the button recovers. *(The app throws on a reverted receipt
      (`status: reverted`). If you can't force a revert, note it as not-exercised.)*
- [ ] 🟠 Toast never hangs forever on a stuck tx (a stuck receipt times out ~180s into an error,
      it does not spin indefinitely).

**Fail if:** a toast never resolves, a reject leaves a stuck placeholder, a revert reads as
success, or an explorer link points at the wrong chain/tx.

---

## Screen: Global sidebar search (any page) 🔵

The left sidebar search box, placeholder **"Search by Address / Tx Hash"**.

> Strict-checksum note: address validation is strict - a **mixed-case address with a wrong
> checksum is rejected**. All-lowercase and correctly-checksummed addresses are accepted.

- [ ] Valid **checksummed** address -> resolves to the address result.
- [ ] Same address **all-lowercase** -> resolves (not rejected).
- [ ] Valid **66-char tx hash** -> resolves to the tx page.
- [ ] **Mixed-case wrong-checksum** address (flip one letter's case) -> **rejected** (intended).
- [ ] **Junk** (`0x123`, `hello`) -> no match / rejected.
- [ ] Console clean.

**Fail if:** a checksummed OR all-lowercase address is rejected, or a valid tx hash/address stops
resolving. (A wrong-checksum address being rejected is expected.)

---

## Screen: `/` - Bridge form

The heaviest screen. Do the read-only sub-sections first (no funds), then the write sub-sections.
Test **both directions** (mainnet->gnosis, gnosis->mainnet) for anything direction-dependent.

### 🔵 Token dropdown - custom-token lookup

Open **"Select token"** -> **"Search asset"** field.

- [ ] Valid **ERC20 not already in the list** (checksummed) -> resolves and is selectable.
- [ ] Same address **all-lowercase** -> still resolves (no premature **"Not found."**).
- [ ] **EOA** address -> **"Not found."**
- [ ] **Non-token contract** address -> **"Not found."**
- [ ] **Wrong-checksum** address -> rejected.
- [ ] Flip direction and repeat with a token whose pair lives on the other chain -> resolves with
      the correct paired address.
- [ ] Console clean (no unhandled rejection when the EOA/non-token reverts the multicall).

### 🔵 Wallet balance + MAX

- [ ] Connect wallet; the selected token's **wallet balance** shows next to the amount field.
- [ ] **MAX** fills the full balance.
- [ ] Switch token -> balance updates. Switch chain -> balance updates for the active chain.

**Fail if:** stale/zero/wrong-chain balance; MAX doesn't fill the full balance.

### 🔵 Bridge limits + validation

- [ ] Select an **XDAI token (DAI/USDS)** -> min/max per-tx + remaining-daily render.
- [ ] Amount **below min** / **above max** / **above remaining daily** -> each shows the correct
      validation message and blocks submit.
- [ ] Repeat with an **OMNI token (USDC/USDT)**.

**Fail if:** limits missing, or an out-of-range amount is allowed through.

### 🔵 "You receive" / destination token info

- [ ] Select a token + enter an amount -> **"You receive"** shows destination symbol, paired
      address on the other chain, and fee-adjusted output.
- [ ] Flip direction -> destination info recomputes correctly.
- [ ] Switching tokens shows the icon skeleton briefly, then the correct token (no stuck/blank).

### 🔵 Recipient validation + summary

- [ ] The balance shown by `UserBalance` matches the wallet (same as the MAX check).
- [ ] Enter a **recipient** address (valid, then invalid, then an ENS/domain name) -> the
      validation message and the summary update correctly.
- [ ] The **transaction summary / TxPreview** (gas + "you receive") renders; no NaN / blank fee.

### 🟠 Approve step

For an ERC20 that needs allowance (both chains where applicable):

- [ ] Click **"Approve"** -> confirm -> the primary button advances to **"Bridge"**.
- [ ] Reload, re-enter the amount -> allowance remembered, **no second Approve**.
- [ ] Re-confirm the cross-cutting **reject** behavior on the approve tx.

**Fail if:** it re-asks for approval every time, or the button doesn't advance.

### 🟠 Bridge write - token/direction matrix

Each row exercises a **different handler branch**. Do the core rows; for the ERC677 / D-ERC20 rows,
run them **if you have a token in that mode** - otherwise tick "n/a" and note it in sign-off (don't
leave the coverage silently implied).

For **every** run: Approve (if shown) -> Bridge -> confirm -> watch bridging status to completion ->
**verify funds arrive on the destination** -> confirm the toast (cross-cutting) behaves.

| # | Token / direction | Handler branch | Done / n/a |
|---|-------------------|----------------|------------|
| 1 | **xDAI -> DAI**, Gnosis -> Eth | native from home | |
| 2 | **xDAI -> USDS**, Gnosis -> Eth | native from home, USDS deposit contract | |
| 3 | **DAI**, Eth -> Gnosis | DAI/USDS from foreign (router) | |
| 4 | **USDS**, Eth -> Gnosis | DAI/USDS from foreign (router) | |
| 5 | **native ETH -> WETH**, Eth -> Gnosis | native from foreign (`wrapAndRelayTokens`) | |
| 6 | **USDT** (standard ERC20), Eth -> Gnosis | ERC20 from foreign, `relayTokens` | |
| 7 | **USDT / ERC20**, Gnosis -> Eth | ERC20 from home, approve-then-`relayTokens` | |
| 8 | **ERC677-mode token**, either direction | `transferAndCall` path | |
| 9 | **dedicated-ERC20 (D-ERC20)**, either direction | 2-arg `relayTokens` path | |
| 10 | **USDC**, Eth -> Gnosis | USDC from foreign -> transmuter (`relayTokensAndCall`) | |

- [ ] Every attempted row completes end-to-end, funds land on the destination, status doesn't stall.
- [ ] Post-submit, the app **redirects to `/bridge/[tx]`** with the correct tx hash in the URL (see
      that screen's checks).

**Fail if:** any row reverts, status stalls, funds don't arrive, or the redirect URL is missing/wrong.

### 🟠 USDC.e Gnosis -> Ethereum: "Swap & Bridge" modal

Select **USDC.e** on **Gnosis**, direction **-> Ethereum**. The primary button becomes
**"Swap & Bridge"**; clicking it opens the 3-step modal (Approve -> Swap -> Bridge).

- [ ] Modal title reads **"Bridge <amt> USDC.e from Gnosis Chain to USDC Ethereum"**.
- [ ] **Approve** step (if allowance needed) -> confirm -> advances to Swap (no stuck "Approving").
- [ ] **Swap** step (USDC.e -> USDC via transmuter) -> confirm -> waits for mining, advances to Bridge.
- [ ] **Bridge** step -> confirm -> completes and redirects to `/bridge/[tx]`.
- [ ] Reject at each step -> that step recovers cleanly (button re-shows), no stuck placeholder.

**Fail if:** any step reverts, a step desyncs/stalls, or a reject strands the modal.

### Cross-check values ( `/` )

| Item | Token / direction | Reference (baseline / chain) | Observed | Pass/Fail | Notes |
|------|-------------------|-------------------------------|----------|-----------|-------|
| Wallet balance | | | | | |
| Per-tx min | | | | | |
| Per-tx max | | | | | |
| Remaining daily | | | | | |
| "You receive" output | | | | | |
| Destination paired addr | | | | | |
| Bridge gas estimate (TxPreview) | | | | | |

---

## Screen: `/bridge/[tx]` - Bridging status + post-bridge redirect

Precondition: an in-flight/recent bridge tx (or the one you just started above). Sample hashes in
the appendix.

- [ ] 🔵 Open `/bridge/[tx]` mid-confirmation. Do **not** refresh - the **confirmation count climbs
      on its own** (5s polling) and **stops at the required count** (no overshoot / never-complete).
- [ ] 🟠 The tx you bridged above lands here via redirect and shows the correct progress from the start.
- [ ] Console clean (no repeated getTransaction errors once the tx has propagated).

**Fail if:** the count is frozen until manual refresh, overshoots, never completes, or the redirect
lands on the wrong/blank tx.

---

## Screen: `/usdc` - USDC transmuter - 🟠

- [ ] Enter an amount. If prompted, **Approve** -> confirm (approve is hash-native - toast + advance).
- [ ] **Swap** -> confirm -> the button stays enabled through the estimate (no throw), balances
      update after mining.
- [ ] Repeat the **reverse direction**.
- [ ] Reject the swap in the wallet -> button recovers, no stuck "Swapping".

**Fail if:** the Swap button is disabled / throws on the gas estimate, or balances don't change.

---

## Screen: `/bridge-explorer/bridges` - Daily limits + dropdown - 🔵

### Daily bridge limits

- [ ] **XDAI home**, **XDAI foreign**, **OMNI home**, **OMNI foreign** cards each render a real number.
- [ ] No **"Invalid token"** on valid tokens.
- [ ] Each card shows a loading skeleton then the value (no permanent skeleton, no flash of 0/NaN).
- [ ] Console clean.

### Token dropdown - custom-token lookup

- [ ] Valid **ERC20** (checksummed) -> resolves; **lowercased** -> resolves; **EOA** / **non-token**
      -> **"Not found."** Console clean.

### Cross-check values ( `/bridge-explorer/bridges` )

| Card | Bridge / side | Reference (baseline / chain) | Observed | Pass/Fail | Notes |
|------|---------------|-------------------------------|----------|-----------|-------|
| Daily limit | XDAI home | | | | |
| Daily limit | XDAI foreign | | | | |
| Daily limit | OMNI home | | | | |
| Daily limit | OMNI foreign | | | | |

---

## Screen: `/bridge-explorer/latest-transactions` - Filter + Claim

- [ ] 🔵 Type a valid **address** into the filter -> list filters to matching rows.
- [ ] 🔵 Type a valid **tx hash** -> list filters correctly.
- [ ] 🔵 Wrong-checksum address behaves per strict `isAddress` (consistent with the sidebar).
- [ ] 🟠 For a **claimable** foreign->home row, the status cell shows a **Claim** button.
- [ ] 🟠 Click **Claim** (label -> **"Claiming…"**) -> the wallet prompt carries the correct
      signature calldata -> confirm -> status flips to **claimed**, button leaves "Claiming…".
- [ ] 🟠 With the wallet on the **wrong chain**, claim fails cleanly into the claim-failed toast
      (it does not send on the wrong chain).
- [ ] Console clean.

**Fail if:** a valid address/hash stops filtering, wrong calldata, the button sticks on "Claiming…",
status doesn't update, or a wrong-chain claim isn't blocked.

---

## Screen: `/bridge-explorer/transaction/[tx]` - Tx detail + Claim - 🟠

- [ ] Open a claimable tx detail page -> **Claim** behaves exactly as in the list (calldata correct,
      status flips to claimed, no stuck state).
- [ ] A read failure during claim prep lands in the claim-failed toast (button not stuck on an
      unhandled rejection).

---

## Screen: `/bridge-explorer/my-transactions` - 🔵 reads

- [ ] Connect wallet -> your transactions list renders and matches the baseline for the same address.
- [ ] Console clean.

---

## Screen: `/bridge-explorer/validators` - 🔵

- [ ] For a few validators, the **Balance** section renders on **both chains** alongside Last seen /
      Signed (24h) / Executed (24h).
- [ ] Low-balance styling still triggers on low validators.
- [ ] Cross-check a balance against gnosisscan/etherscan.

### Cross-check values ( validators )

| Validator | Chain | Reference (chain) | Observed | Pass/Fail |
|-----------|-------|-------------------|----------|-----------|
| | mainnet | | | |
| | gnosis | | | |

**Fail if:** balances are 0/blank/wrong-chain.

---

## Test data appendix

Recorded sample transactions (in `/tests`), usable for search / `/bridge/[tx]` / tx-detail:

| Bridge | Direction | Tx hash |
|--------|-----------|---------|
| AMB | ETH -> GC | `0x1ee6145c90000c15d5b93b28a66576fd33cffed3e6f387b0c34f529c7f68372f` |
| AMB | GC -> ETH | `0xb6184ff9e290b6d090c9196537be3131a2055d9026603be2a8c7f51de675fafd` |
| Native | ETH -> GC | `0xc4d10ca90be28c23e77e7d847de259d033d774a562d7a4a27fdf8f5f6cc09599` |
| Native | GC -> ETH | `0xfd04c177dcf232f462aa6304621181a39bdb194bcb547cc3f785333822d06f59` |

Address test inputs:
- **Checksummed ERC20:** a bridgeable token **not** in the dropdown's top-tokens list (so the
  on-chain lookup fires).
- **Lowercase variant:** same address, `.toLowerCase()`.
- **Wrong-checksum variant:** a valid checksummed address with one letter's case flipped.
- **EOA:** any wallet address with no contract code.
- **Non-token contract:** any deployed non-ERC20 (e.g. a bridge/router).

Token -> handler-branch reference (for the `/` write matrix):
- **native xDAI** (Gnosis->Eth) and **DAI/USDS** (Eth->Gnosis) -> native / router handlers.
- **native ETH** (Eth->Gnosis), **standard ERC20 / ERC677 / D-ERC20**, and **USDC/USDC.e** -> the
  OMNI / transmuter handlers. `tokenMode` (`ERC20` / `ERC677` / `D-ERC20`) decides the branch; check
  it if unsure which a given token hits.

---

## Sign-off

- [ ] Read-only pass (🔵) complete
- [ ] Write pass (🟠) complete
- [ ] Cross-cutting behaviors (connect / switch-network / toasts / reject / revert) confirmed
- [ ] `/` write matrix: every row done or explicitly marked n/a (list untested rows below)
- [ ] Cross-check tables filled; every numeric value matches gnosisscan/etherscan or the baseline
- [ ] Tested **both bridge directions** for every direction-dependent surface
- [ ] Browser console clean across all screens (no RPC/provider/undefined errors)
- [ ] `pnpm app:lint` + `pnpm tsc --noEmit` pass on the build

| Field | Value |
|-------|-------|
| Build / branch tested | |
| Commit SHA | |
| Environment (local / preview / staging) | |
| Tester | |
| Date | |
| Result (Pass / Fail) | |
| Write matrix rows left untested (n/a) | |
| Issues found (links) | |
