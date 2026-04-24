# Technical Plan

## Components
- MCP Tool: `deploy` in `mcp-server/src/index.ts`
- Tool Implementation: `mcp-server/src/tools/deployMetadata.ts`
- Types: `DeploySpec`, `DeployResult` in `mcp-server/src/types/`

## Tool API
```
deploy({
  projectId: string,
  orgAlias?: string,          // Target org alias (uses default if not provided)
  metadataTypes?: string[],   // Specific metadata types to deploy
  testLevel?: string          // Run local tests, run all tests, skip testing
})
```

## Implementation Steps
1. Copy DeployTypes to mcp-server/src/types/
2. Copy deployMetadata generator to mcp-server/src/tools/
3. Register tool in mcp-server/src/index.ts
