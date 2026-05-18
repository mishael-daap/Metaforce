# Stage 1: Build
# Install all deps (including devDependencies) and compile TypeScript
FROM node:20 AS builder

WORKDIR /app

COPY package.json package-lock.json tsconfig.json ./
RUN npm install

COPY src ./src
RUN npx tsc

# Stage 2: Production
FROM node:20

# Install system dependencies: Java (required by CLI for metadata ops),
# curl and ca-certificates (required for HTTPS to Salesforce orgs)
RUN apt-get update && apt-get install -y \
    openjdk-17-jre-headless \
    curl \
    ca-certificates \
    && rm -rf /var/lib/apt/lists/*

# Install Salesforce CLI globally with all its dependencies
RUN npm install -g @salesforce/cli

WORKDIR /app

# Install production dependencies only
COPY package.json package-lock.json ./
RUN npm ci --omit=dev

# Copy compiled artifacts from the build stage
COPY --from=builder /app/dist ./dist

EXPOSE 8000

CMD ["node", "dist/index.js"]
