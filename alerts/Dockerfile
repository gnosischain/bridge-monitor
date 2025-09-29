# Production stage
FROM node:18-alpine


# Accept build arguments
ARG SUBGRAPH_API_KEY
ARG SUBGRAPH_API_FOREIGN
ARG SUBGRAPH_API_NATIVE

# Set them as environment variables for the build
ENV SUBGRAPH_API_KEY=$SUBGRAPH_API_KEY
ENV SUBGRAPH_API_FOREIGN=$SUBGRAPH_API_FOREIGN
ENV SUBGRAPH_API_NATIVE=$SUBGRAPH_API_NATIVE


# Install dumb-init for proper signal handling
RUN apk add --no-cache dumb-init

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
RUN yarn subgraph 
RUN yarn build


# Create data directory with correct ownership
RUN mkdir -p /app/data    

# Use dumb-init to handle signals properly
ENTRYPOINT ["dumb-init", "--"]

# Default command
CMD ["yarn", "start"]