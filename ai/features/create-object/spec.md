# Feature: Create Object Tool

## Purpose
Generate custom object metadata XML files for Salesforce deployment.

## User Flow
1. User provides object details: fullName, label, pluralLabel, deploymentStatus, sharingModel, visibility, nameField
2. MCP tool creates the object directory and XML file
3. Returns confirmation with file path

## Rules
- `fullName` must end with `__c`
- `deploymentStatus`: 'Deployed' or 'InDevelopment'
- `sharingModel`: 'ReadWrite', 'Private', or 'ControlledByParent'
- `visibility`: 'Public' or 'PackageProtected'
- `nameField.type`: 'Text' or 'AutoNumber'
- Overwrites existing object files

## Acceptance Criteria
- [ ] Tool accepts all required object parameters
- [ ] Creates object directory under force-app/objects/
- [ ] Generates valid Salesforce XML metadata file
- [ ] Returns user-friendly success message
- [ ] Validates all enum values
