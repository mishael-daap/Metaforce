# Feature: SFDX Server

## Purpose
Provide a stateless, Dockerized Node.js/Express service that generates Salesforce metadata XML files, deploys them to a connected Salesforce org, and returns a single response — all in one request.

## User Flow (API Consumer)
1. The Next.js backend sends a request to the SFDX server with the project context in headers (`x-api-key`, `x-project-id`, `x-access-token`, `x-org-url`)
2. The server lazily initializes the SFDX project if it doesn't exist (creates directory, sfdx-project.json, force-app structure, and authenticates the org via Salesforce CLI)
3. If the project exists, it skips setup and reuses
4. The server generates the requested metadata XML (custom object or custom field) and writes it to the force-app directory
5. The server immediately runs `sf project deploy start`
6. The server returns a single JSON response with: a single `status` boolean, an error message (if any), and the list of created metadata items

## Rules
- The server is stateless: no database, no sessions
- `x-api-key` is required on every request
- `x-project-id`, `x-access-token`, and `x-org-url` are required project context headers
- Project directory (by `projectId`) is created lazily on the first request
- Metadata creation and deployment are atomic — a single endpoint call does both
- Only two types of metadata are supported for this POC: custom objects and custom fields
- Salesforce CLI must be installed and available in the Docker container

## Response Shape (all endpoints)
```json
{
  "status": true,
  "error": null,
  "createdItems": [
    { "name": "...", "type": "...", "path": "..." }
  ]
}
```
- `status`: boolean — `true` if setup, creation, and deployment all succeeded; `false` if any step failed
- `error`: string describing what went wrong, or `null`
- `createdItems`: array of metadata items created by this request

## Acceptance Criteria
- [ ] `POST /metadata/objects` creates a custom object XML, deploys it, and returns the standard response
- [ ] `POST /metadata/fields` creates a custom field XML, deploys it, and returns the standard response
- [ ] `GET /metadata/objects` lists all custom objects for the given project
- [ ] `GET /metadata/objects/:apiName` gets a specific custom object for the given project
- [ ] All endpoints validate `x-api-key` and return 401 if missing/invalid
- [ ] All endpoints require project context headers and return 400 if missing
- [ ] Project is lazily initialized: directory + sfdx-project.json + force-app + SFDX auth
- [ ] Response shape has a single `status` boolean, not separate creation/deployment statuses
