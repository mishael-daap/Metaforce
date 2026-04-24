# Feature: Create Project Tool

## Purpose
Create a new Salesforce DX project environment inside the Docker container with the standard `sfdx-project.json` configuration and `force-app` directory structure.

## User Flow
1. User provides a `projectId` (e.g., "my-project")
2. Optionally provides `name`, `apiVersion`, `namespace`
3. MCP tool creates the project directory structure
4. Returns confirmation with project path

## Rules
- `projectId` is required
- `projectId` cannot contain invalid characters: `<>:"|?*`
- If a project with the same `projectId` exists, overwrite it
- Default `apiVersion` is "66.0"
- Default `sfdcLoginUrl` is "https://login.salesforce.com"
- Project is created inside the Docker container filesystem

## Acceptance Criteria
- [ ] Tool accepts `projectId`, `name`, `apiVersion`, `namespace` parameters
- [ ] Creates `sfdx-project.json` with correct configuration
- [ ] Creates `force-app` directory structure
- [ ] Returns user-friendly success message with project path
- [ ] Returns clear error message on failure
- [ ] Overwrites existing project with same `projectId`
