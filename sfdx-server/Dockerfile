# Stage 1: Salesforce CLI Image
FROM salesforce/cli:latest-slim AS sfdx-cli

# Stage 2: Node.js + App
FROM node:20-slim

# Install OpenSSL and Java (required by Salesforce CLI for some operations)
RUN apt-get update && apt-get install -y \
    openjdk-17-jre-headless \
    && rm -rf /var/lib/apt/lists/*

# Copy Salesforce CLI from the official image
COPY --from=sfdx-cli /usr/local/bin/sf /usr/local/bin/sf
COPY --from=sfdx-cli /usr/local/lib/node_modules/@salesforce /usr/local/lib/node_modules/@salesforce

# Set working directory
WORKDIR /app

# Copy package files
COPY package.json tsconfig.json ./

# Install dependencies
RUN npm install

# Copy source code
COPY src ./src

# Build TypeScript
RUN npx tsc

# Expose port
EXPOSE 8000

# Start the server
CMD ["node", "dist/index.js"]
