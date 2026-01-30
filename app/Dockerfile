FROM node:22.13.1-alpine AS base
RUN corepack enable && corepack prepare pnpm@9.6.0 --activate

FROM base AS deps
RUN apk add --update --no-cache
RUN apk add --no-cache libc6-compat
RUN apk add python3 make g++
WORKDIR /workspace

# Copy workspace root files for pnpm
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY app/package.json ./app/

# Install dependencies for the app workspace
RUN pnpm install --filter gnosis-bridge-explorer --frozen-lockfile

FROM base AS builder
WORKDIR /workspace

# Copy workspace config and installed deps
COPY --from=deps /workspace/node_modules ./node_modules
COPY --from=deps /workspace/app/node_modules ./app/node_modules
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./

# Copy app source
COPY app ./app

ENV NEXT_TELEMETRY_DISABLED 1

ARG NEXT_PUBLIC_APP_NAME
ARG NEXT_PUBLIC_DEFAULT_THEME
ARG NEXT_PUBLIC_DEFAULT_CHAIN_ID
ARG NEXT_PUBLIC_COOKIES_WARNING_ENABLED
ARG NEXT_PUBLIC_POLLING_INTERVAL
ARG NEXT_PUBLIC_RPC_MAINNET
ARG NEXT_PUBLIC_RPC_GNOSIS
ARG NEXT_PUBLIC_WALLET_CONNECT_DAPP_URL
ARG NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID
ARG NEXT_PUBLIC_SUBGRAPH_ENVIRONMENT
ARG NEXT_PUBLIC_SUBGRAPH_ACCESS_ID
ARG NEXT_PUBLIC_SUBGRAPH_CHAINS_RESOURCE_IDS
ARG NEXT_PUBLIC_ALCHEMY_API_KEY
ARG NEXT_PUBLIC_ENVIO_INDEXER_URL
ARG NEXT_PUBLIC_INDEXER_BACKEND

RUN pnpm --filter gnosis-bridge-explorer build

FROM base AS runner
WORKDIR /app

ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder --chown=nextjs:nodejs /workspace/app/package.json /workspace/pnpm-lock.yaml ./
COPY --from=builder --chown=nextjs:nodejs /workspace/app/public ./public
COPY --from=builder --chown=nextjs:nodejs /workspace/app/next.config.js ./
COPY --from=builder --chown=nextjs:nodejs /workspace/app/.next ./.next
COPY --from=builder --chown=nextjs:nodejs /workspace/app/node_modules ./node_modules

USER nextjs

EXPOSE 3000

ENV PORT 3000

CMD ["pnpm", "start"]
