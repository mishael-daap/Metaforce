# Feature: Deploy Tool

## Purpose
Deploy generated metadata to a Salesforce org using the Salesforce CLI.

## User Flow
1. User provides projectId and optionally target org alias
2. MCP tool runs `sf project deploy start` command
3. Returns deployment results

## Rules
- Requires Salesforce CLI to be installed in container
- Requires authenticated org
- Deploys from force-app directory

## Acceptance Criteria
- [ ] Tool accepts projectId and optional org parameters
- [ ] Runs sf deploy command
- [ ] Returns deployment success/failure status
- [ ] Returns deployment details and errors
