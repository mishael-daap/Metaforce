# Technical Plan

## Components
- MCP Tool: `createField` in `mcp-server/src/index.ts`
- Tool Implementation: `mcp-server/src/tools/createCustomField.ts`
- Types: `CustomFieldSpec` and field type variants in `mcp-server/src/types/`
- XML Builder: `mcp-server/src/xml/builders/customFieldBuilder.ts`

## Tool API
```
createField({
  projectId: string,
  objectName: string,         // e.g., "MyObject__c"
  fullName: string,           // e.g., "MyField__c"
  label: string,
  type: string,               // Text, Number, Currency, Checkbox, Date, etc.
  // Type-specific options:
  length?: number,            // For Text
  precision?: number,         // For Number/Currency/Percent
  scale?: number,             // For Number/Currency/Percent
  required?: boolean,
  defaultValue?: any,
  description?: string
})
```

## Implementation Steps
1. Copy CustomFieldSpec types to mcp-server/src/types/
2. Copy customFieldBuilder to mcp-server/src/xml/builders/
3. Copy createCustomField generator to mcp-server/src/tools/
4. Register tool in mcp-server/src/index.ts
