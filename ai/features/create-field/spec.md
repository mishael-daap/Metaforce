# Feature: Create Field Tool

## Purpose
Add custom fields to existing Salesforce objects by generating field metadata XML files.

## User Flow
1. User provides field details: objectName, fullName, label, type, and type-specific options
2. MCP tool creates field directory and XML file under the object
3. Returns confirmation with file path

## Rules
- `fullName` must end with `__c`
- Field must be added to an existing object directory
- Supports all standard Salesforce field types

## Acceptance Criteria
- [ ] Tool accepts field parameters for all field types
- [ ] Creates field directory under force-app/objects/[ObjectName]/fields/
- [ ] Generates valid Salesforce field XML metadata
- [ ] Returns user-friendly success message
