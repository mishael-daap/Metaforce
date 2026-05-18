# Technical Plan

## Components
- `sfdx-server/` : Root directory for the server
- `src/index.ts` : Express app, main entry point
- `src/middleware/auth.ts` : API key validation middleware
- `src/middleware/projectContext.ts` : Extracts project context from headers
- `src/routes/metadata.ts` : Object and field routes
- `src/services/projectSetup.ts` : Lazy SFDX project setup + SFDX CLI auth
- `src/services/customObject.ts` : Generates custom object XML, writes file
- `src/services/customField.ts` : Generates custom field XML, writes file
- `src/services/deploy.ts` : Runs `sf project deploy start`, parses JSON output
- `src/xml/builders/customObjectBuilder.ts` : XML string builder for CustomObject
- `src/xml/builders/customFieldBuilder.ts` : XML string builder for CustomField
- `Dockerfile` : Multi-stage build with Node.js + Salesforce CLI + Java runtime
- `package.json` : Express, TypeScript, ts-node, and development dependencies

## API
- `POST /metadata/objects` — Create and deploy a custom object
  - Body: CustomObjectSpec (fullName, label, pluralLabel, etc.)
- `POST /metadata/fields` — Create and deploy a custom field
  - Body: { objectName: string, field: CustomFieldSpec }
- `GET /metadata/objects` — List all custom objects for the project
- `GET /metadata/objects/:apiName` — Get a specific custom object

No PUT or DELETE endpoints — only creation and retrieval.

## Data Model
No database. Uses filesystem:
- `<projectId>/sfdx-project.json`
- `<projectId>/force-app/objects/<ObjectName>/<ObjectName>.object-meta.xml`
- `<projectId>/force-app/objects/<ObjectName>/fields/<FieldName>.field-meta.xml`

## Flow
Request → Validate API Key → Extract Project Context → Ensure Project Exists (lazy init + auth if not) → Generate XML → Write to Force-App → Run `sf project deploy start` → Parse CLI JSON output → Build single status response → Return

## Notes
- Use `sf org login access-token` for authentication during project setup
- Deploy command runs from the project directory (`cwd: projectPath`)
- XML generation is done via string templating, matching exact Salesforce metadata API format
- If setup, creation, or deployment fails, `status` is `false` and `error` contains the message
- `createdItems` is populated only for items that were successfully written before failure
