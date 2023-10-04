FROM node:18.0.0-alpine AS base

FROM base AS deps
RUN apk add --no-cache libc6-compat
RUN yarn policies set-version v1.22.19
RUN npm version
WORKDIR /app

COPY package.json yarn.lock subgraph-config.js ./
COPY /src ./src
RUN  yarn install --frozen-lockfile
RUN  yarn postinstall

FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/src ./src
COPY --from=deps /app/types ./types
COPY . .

ENV NEXT_TELEMETRY_DISABLED 1

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
