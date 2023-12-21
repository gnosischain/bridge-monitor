FROM node:18.0.0-alpine AS base

FROM base AS deps
RUN apk add --update --no-cache
RUN apk add --no-cache libc6-compat
RUN apk add python3 make g++
RUN yarn policies set-version v1.22.19
RUN npm version
WORKDIR /app

# Copy .env file if it exists for local tests
# COPY .env* ./.env

ARG NEXT_PUBLIC_APP_NAME
ARG NEXT_PUBLIC_DEFAULT_THEME
ARG NEXT_PUBLIC_DEFAULT_CHAIN_ID
ARG NEXT_PUBLIC_COOKIES_WARNING_ENABLED
ARG NEXT_PUBLIC_POLLING_INTERVAL
ARG NEXT_PUBLIC_RPC_MAINNET
ARG NEXT_PUBLIC_RPC_GNOSIS
ARG NEXT_PUBLIC_RPC_CHIADO
ARG NEXT_PUBLIC_WALLET_CONNECT_DAPP_URL
ARG NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID
ARG NEXT_PUBLIC_SUBGRAPH_ENVIRONMENT
ARG NEXT_PUBLIC_SUBGRAPH_ACCESS_ID
ARG NEXT_PUBLIC_SUBGRAPH_CHAINS_RESOURCE_IDS

COPY package.json yarn.lock subgraph-config.js ./
COPY /src ./src
RUN  yarn install 
# RUN  yarn postinstall ## Omit subgraph compilation for goldsky compability

FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/src ./src
COPY --from=deps /app/types ./types
COPY . .

ENV NEXT_TELEMETRY_DISABLED 1

ARG NEXT_PUBLIC_APP_NAME
ARG NEXT_PUBLIC_DEFAULT_THEME
ARG NEXT_PUBLIC_DEFAULT_CHAIN_ID
ARG NEXT_PUBLIC_COOKIES_WARNING_ENABLED
ARG NEXT_PUBLIC_POLLING_INTERVAL
ARG NEXT_PUBLIC_RPC_MAINNET
ARG NEXT_PUBLIC_RPC_GNOSIS
ARG NEXT_PUBLIC_RPC_CHIADO
ARG NEXT_PUBLIC_WALLET_CONNECT_DAPP_URL
ARG NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID
ARG NEXT_PUBLIC_SUBGRAPH_ENVIRONMENT
ARG NEXT_PUBLIC_SUBGRAPH_ACCESS_ID
ARG NEXT_PUBLIC_SUBGRAPH_CHAINS_RESOURCE_IDS

RUN yarn build

FROM base AS runner
WORKDIR /app

ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder --chown=nextjs:nodejs /app/package.json /app/yarn.lock ./
COPY --from=builder --chown=nextjs:nodejs /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/next.config.js  ./
COPY --from=builder --chown=nextjs:nodejs /app/.next ./.next
COPY --from=builder --chown=nextjs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nextjs:nodejs /app/package.json ./package.json

USER nextjs

EXPOSE 3000

ENV PORT 3000

CMD ["yarn", "start"]
