# Technical Plan

## Components
- MCP Tool: `createObject` in `mcp-server/src/index.ts`
- Tool Implementation: `mcp-server/src/tools/createCustomObject.ts`
- Types: `CustomObjectSpec`, `NameFieldSpec` in `mcp-server/src/types/`
- XML Builder: `mcp-server/src/xml/builders/customObjectBuilder.ts`

## Tool API
```
createObject({
  projectId: string,
  fullName: string,           // e.g., "MyObject__c"
  label: string,
  pluralLabel: string,
  description?: string,
  deploymentStatus: string,   // 'Deployed' | 'InDevelopment'
  sharingModel: string,       // 'ReadWrite' | 'Private' | 'ControlledByParent'
  visibility: string,         // 'Public' | 'PackageProtected'
  nameField: {
    label: string,
    type: string,             // 'Text' | 'AutoNumber'
    displayFormat?: string,
    scale?: number,
    trackHistory?: boolean
  }
})
```

## Implementation Steps
1. Copy types to `mcp-server/src/types/CustomObjectSpec.ts`
2. Copy XML builder to `mcp-server/src/xml/builders/customObjectBuilder.ts`
3. Copy generator to `mcp-server/src/tools/createCustomObject.ts`
4. Register tool in `mcp-server/src/index.ts`
