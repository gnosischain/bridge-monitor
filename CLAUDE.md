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
cd app && pnpm typechain   # Regenerate TypeChain types from ABIs
```

### Indexer (`/envio-indexer`)
```bash
pnpm indexer:dev      # Start indexer in dev mode
pnpm indexer:codegen  # Regenerate types from config.yaml
cd envio-indexer && pnpm mocha   # Run indexer tests
```

### Alerts (`/alerts`)
```bash
cd alerts && pnpm dev   # Run alerts service with ts-node
cd alerts && pnpm build # Compile TypeScript
```

## Architecture

### Frontend (`/app/src/`)

**Tech stack:** Next.js 15 + React 18, Ethers.js v5 (legacy) + Viem v2 (modern), Web3Onboard v2 (wallet), Styled Components, SWR (data fetching), TypeChain (contract types).

**Key structural patterns:**
- Pages in `/app/pages/bridge-explorer/` — each route has a corresponding `pagePartials/` folder for page-specific components
- `NextPageWithLayout` pattern for per-page layouts; `SingleColumnLayout` is the default
- Provider tree in `_app.tsx`: `Web3ConnectionProvider` (dynamic/no-SSR) → `ThemeProvider` → `TransactionNotificationProvider` → `TokenListProvider` → `ValidatorsProvider`
- Contract ABIs live in `src/abis/` and generate TypeChain types via `pnpm typechain`
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

Frontend (`SWR` hooks) → Envio GraphQL API (`NEXT_PUBLIC_ENVIO_INDEXER_URL`) → Indexed on-chain events → Bridge contracts on Ethereum (chain 1) and Gnosis Chain (chain 100).

## Environment Setup

Copy and fill `.env.example` files:
- `app/.env.local` — requires RPC URLs, WalletConnect project ID, Envio indexer GraphQL URL
- `alerts/.env` — requires Slack token/channel, RPC URLs, subgraph URLs

Node version is pinned in `.nvmrc` (v22.11.0). Use `nvm use` before installing.

## Git Workflow

- Feature branches are created from `develop`
- PRs target `develop` → promoted to `staging` → `main` (production)
- Pre-commit hooks (Husky + lint-staged) run ESLint fix, Prettier, and `tsc` on staged files
