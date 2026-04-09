# Production stage
FROM node:22-alpine

# Accept build arguments
ARG ENVIO_INDEXER_URL

ENV ENVIO_INDEXER_URL=$ENVIO_INDEXER_URL

# Install dumb-init for proper signal handling
RUN apk add --no-cache dumb-init

# Set working directory
WORKDIR /app

# Copy package files
COPY package.json ./

# Install dependencies using pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate
COPY pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

# Copy source code
COPY . .

# Generate types
RUN pnpm typechain
RUN pnpm build

# Create data directory with correct ownership
RUN mkdir -p /app/data

# Use dumb-init to handle signals properly
ENTRYPOINT ["dumb-init", "--"]

# Default command
CMD ["pnpm", "start"]
