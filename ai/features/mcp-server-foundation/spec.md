# Feature: MCP Server Foundation

## Purpose
Initialize a Dockerized MCP server that runs independently and can be verified as operational.

## User Flow
1. User runs `docker compose up`
2. MCP server container starts
3. Server listens on port 8000
4. User can ping `http://localhost:8000/mcp` to verify it's running

## Rules
- MCP server runs on port 8000
- Uses Node 20 full image (`node:20`)
- Uses `@modelcontextprotocol/server` and `@modelcontextprotocol/express`
- Uses `NodeStreamableHTTPServerTransport` for SSE transport
- Follows the pattern in `ai/context/mcp-server-example.md`

## Acceptance Criteria
- [ ] `/mcp-server` directory exists with server code
- [ ] `Dockerfile` builds successfully
- [ ] `docker-compose.yml` orchestrates the container on port 8000
- [ ] `docker compose up` starts the server without errors
- [ ] Server responds to HTTP requests on port 8000
