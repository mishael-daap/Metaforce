# Technical Plan: MCP Server Foundation

## Files to Create

```
/mcp-server/
  package.json          # Dependencies: @modelcontextprotocol/server, @modelcontextprotocol/express, express, zod
  Dockerfile            # Node 20 full image, copy src, run server
  docker-compose.yml    # Port 8000:8000, build context
  src/
    index.ts            # Main server entry point with ping tool
    tools/
      ping.ts           # Simple ping tool that returns "pong"
```

## Server Structure

- Express app created with `createMcpExpressApp()`
- MCP server registers a simple `ping` tool
- SSE transport on `/mcp` endpoint using `NodeStreamableHTTPServerTransport`
- Graceful shutdown handlers for SIGINT/SIGTERM

## Dependencies

- `@modelcontextprotocol/server` - MCP server SDK
- `@modelcontextprotocol/express` - Express middleware for MCP
- `express` - Web framework
- `zod` - Schema validation for tool inputs

## Docker Configuration

- Base image: `node:20` (full image for debugging)
- Exposed port: 8000
- Working directory: `/app`
- Build context: `./mcp-server`
