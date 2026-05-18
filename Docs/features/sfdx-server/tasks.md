# Tasks

- [x] Create sfdx-server directory structure with src/, Dockerfile, tsconfig.json, package.json
- [x] Implement XML builders: customObjectBuilder.ts and customFieldBuilder.ts
- [x] Implement projectSetup.ts: lazy SFDX project init + CLI authentication
- [x] Implement customObject.ts service: validate, generate XML, write to filesystem
- [x] Implement customField.ts service: validate, generate XML, write to filesystem
- [x] Implement deploy.ts service: run sf project deploy start, parse JSON response
- [x] Implement auth middleware: validate x-api-key
- [x] Implement projectContext middleware: extract and validate project headers
- [x] Implement metadata routes: POST /metadata/objects, POST /metadata/fields
- [x] Implement GET /metadata/objects and GET /metadata/objects/:apiName
- [x] Wire everything together in Express app (src/index.ts)
- [x] Create Dockerfile: Node.js + Salesforce CLI installation + Java runtime
- [ ] Build and verify the Docker image starts correctly
