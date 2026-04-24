# Technical Plan

## Components
- MCP Tool: `createProject` in `mcp-server/src/index.ts`
- Tool Implementation: `mcp-server/src/tools/createProject.ts`
- Types: `ProjectSpec`, `CreateProjectResult` (copied from reference)

## Tool API
```
createProject({
  projectId: string,      // required
  name?: string,          // optional, defaults to projectId
  apiVersion?: string,    // optional, defaults to "66.0"
  namespace?: string      // optional, defaults to ""
})
```

## Data Flow
```
User Input → MCP Tool → createProject() → Filesystem → Response
```

## Implementation Steps
1. Copy `createProject.ts` from `ai/context/reference-tools/generators/` to `mcp-server/src/tools/`
2. Copy `ProjectSpec.ts` types to `mcp-server/src/types/`
3. Register tool in `mcp-server/src/index.ts` with user-friendly response formatting
4. Update `fs` to overwrite existing files (remove `existsSync` check for project root)

## Notes
- Tool runs inside Docker container
- Uses Node.js `fs` module for file operations
- Returns formatted text message, not just JSON
