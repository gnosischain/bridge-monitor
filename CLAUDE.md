# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

This is a monorepo for the **Gnosis Bridge Monitor** — a real-time bridge transaction explorer for Gnosis Chain. It includes:
- `/app` — Next.js frontend (bridge explorer UI)
- `/envio-indexer` — Envio blockchain indexer (real-time event indexing via GraphQL)
- `/alerts` — Slack alert system for validator balances and bridge limits
- `/tests` — Test plans and records

## Common Commands

All commands run from the repo root using pnpm workspaces, or from within the package directory.

### Frontend (`/app`)
```bash
pnpm app:dev          # Start Next.js dev server
pnpm app:build        # Production build
pnpm app:lint         # Lint (ESLint + Prettier)
pnpm app:lint:fix     # Auto-fix lint issues
```

### Indexer (`/envio-indexer`)
```bash
pnpm indexer:dev      # Start indexer in dev mode
pnpm indexer:codegen  # Regenerate types from config.yaml
cd envio-indexer && pnpm mocha   # Run indexer tests
```

### Alerts (`/alerts`)

⚠️ `/alerts` is **not a pnpm workspace package**, it was removed from `pnpm-workspace.yaml` so its
TypeChain dev dependency (which pulls `glob@7` → `minimatch@3`) stays out of the root lockfile and out
of `pnpm audit`. It is not built or deployed by any CI workflow, and its `Dockerfile` expects an
`alerts/pnpm-lock.yaml` that does not exist. Treat it as dormant: it needs its own install before
anything in it will run.

Because it is de-workspaced, Socket Security would ingest `alerts/package.json` as a standalone
project where the root pnpm `overrides` do not apply, flagging `ethers@5.7.1` →
`@ethersproject/signing-key@5.7.0` → `elliptic@6.5.4` (GHSA-vjh7-7g9h-fjfh, CRITICAL — an exact pin,
so no range can float it). Root `socket.yml` therefore lists `alerts` in `projectIgnorePaths`. If
`/alerts` is ever revived, remove it from that ignore list and fix the dependency properly (ethers v6
drops `elliptic` for `@noble/curves`).

```bash
cd alerts && pnpm dev   # Run alerts service with ts-node (requires a local install first)
cd alerts && pnpm build # Compile TypeScript
```

## Architecture

### Frontend (`/app/src/`)

**Tech stack:** Next.js 15 + React 18, Wagmi / Viem, Styled Components, tanStack query.

**Key structural patterns:**
- Pages in `/app/pages/bridge-explorer/` — each route has a corresponding `pagePartials/` folder for page-specific components
- `NextPageWithLayout` pattern for per-page layouts; `SingleColumnLayout` is the default
- Provider tree in `_app.tsx`: `Web3ConnectionProvider` (dynamic/no-SSR) → `ThemeProvider` → `TransactionNotificationProvider` → `TokenListProvider` → `ValidatorsProvider`
- Contract ABIs live in `src/abis/`
- Bridge and chain configuration is centralized in `src/constants/` (bridges, validators, chains, contracts)

**Bridge types supported:**
- XDAI Bridge: native token bridge (DAI/USDS)
- OmniBridge (AMB): multi-token bridge (USDC, USDT, ERC-20s)
- USDC Transmuter: handles USDC variant bridging

### Indexer (`/envio-indexer/`)

**Tech stack:** Envio v2, Viem, TypeScript, Mocha/Chai for tests.

The indexer tracks bridge transaction lifecycle via on-chain events:
1. `UserRequestForSignature` — bridge initiated
2. `SignedForUserRequest` — validator signed
3. `CollectedSignatures` — threshold reached
4. `AffirmationCompleted` — executed on destination

Configuration is in `config.yaml` (networks, contract addresses, event signatures, start blocks). The `schema.graphql` defines the GraphQL API consumed by the frontend. Run `pnpm indexer:codegen` after changing either file.

Generated code lives in `generated/` — do not edit manually.

### Data Flow

Frontend → Envio GraphQL API (`NEXT_PUBLIC_ENVIO_INDEXER_URL`) → Indexed on-chain events → Bridge contracts on Ethereum (chain 1) and Gnosis Chain (chain 100).

## Environment Setup

Copy and fill `.env.example` files:
- `app/.env.local` — requires RPC URLs, WalletConnect project ID, Envio indexer GraphQL URL
- `alerts/.env` — requires Slack token/channel, RPC URLs, subgraph URLs

Node version is pinned in `.nvmrc` (v22.11.0). Use `nvm use` before installing.

## Git Workflow

- Feature branches are created from `develop`
- PRs target `develop` → promoted to `staging` → `main` (production)
- Promotion/backport PRs between `develop`/`staging`/`main` use merge commits (never squash/rebase) so SHAs stay shared
- Hotfixes go directly to `main` (`hotfix/*` → PR base `main`), then backport `main` into BOTH `staging` and `develop` (two PRs, compare `main`) so they don't drift — skipping the develop backport is the usual drift cause
- Pre-commit hooks (Husky + lint-staged) run ESLint fix, Prettier, and `tsc` on staged files
