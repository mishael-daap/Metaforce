# Tasks

- [ ] Create sfdx-server directory structure with src/, Dockerfile, tsconfig.json, package.json
- [ ] Implement XML builders: customObjectBuilder.ts and customFieldBuilder.ts
- [ ] Implement projectSetup.ts: lazy SFDX project init + CLI authentication
- [ ] Implement customObject.ts service: validate, generate XML, write to filesystem
- [ ] Implement customField.ts service: validate, generate XML, write to filesystem
- [ ] Implement deploy.ts service: run sf project deploy start, parse JSON response
- [ ] Implement auth middleware: validate x-api-key
- [ ] Implement projectContext middleware: extract and validate project headers
- [ ] Implement metadata routes: POST /metadata/objects, POST /metadata/fields
- [ ] Implement GET /metadata/objects and GET /metadata/objects/:apiName
- [ ] Wire everything together in Express app (src/index.ts)
- [ ] Create Dockerfile: Node.js + Salesforce CLI installation + Java runtime
- [ ] Build and verify the Docker image starts correctly
