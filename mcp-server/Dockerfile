FROM node:20

WORKDIR /app

RUN npm install -g pnpm typescript

# Only copy mcp-server files - ignore workspace
COPY mcp-server/package.json mcp-server/pnpm-lock.yaml* ./

RUN pnpm install --shamefully-hoist

COPY mcp-server/src ./src
COPY mcp-server/tsconfig.json ./

RUN tsc

EXPOSE 8000

CMD ["node", "dist/index.js"]