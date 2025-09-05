# Production stage
FROM node:18-alpine

# Install dumb-init for proper signal handling
RUN apk add --no-cache dumb-init

# Create app user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S alerts -u 1001

# Set working directory
WORKDIR /app

# Copy package files
COPY package.json ./
COPY yarn.lock ./
COPY .yarnrc.yml ./

# Install dependencies
RUN yarn install && \
    yarn cache clean

# Copy source code
COPY . .

# Generate types
RUN yarn typechain
RUN yarn subgraph --verbose || true
RUN yarn build

# Create data directory for alert state
RUN mkdir -p /app/data && \
    chown -R alerts:nodejs /app

# Switch to non-root user
USER alerts

# Use dumb-init to handle signals properly
ENTRYPOINT ["dumb-init", "--"]

# Default command
CMD ["yarn", "start"]