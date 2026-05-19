// import { Router } from 'express';
// import { ensureProjectExists } from '../services/projectSetup.js';
// import { createCustomObject, deleteCustomObject } from '../services/customObject.js';
// import { createCustomField, deleteCustomField } from '../services/customField.js';
// import { deployMetadata } from '../services/deploy.js';
// import { deleteMetadata } from '../services/deleteMetadata.js';
// import * as fs from 'fs';
// import * as path from 'path';
// import { retrieveMetadata } from '../services/retrieveMetadata.js';

// const router = Router();

// /**
//  * POST /project-setup
//  * Ensures the SFDX project exists and the org is authenticated.
//  */
// router.post('/project-setup', async (req, res) => {
//   try {
//     const { projectId, accessToken, orgUrl } = req.projectContext!;

//     const setupResult = await ensureProjectExists({ projectId, orgUrl, accessToken });
//     if (!setupResult.success) {
//       res.status(500).json({ success: false, error: `Project setup failed: ${setupResult.error}`, components: [] });
//       return;
//     }

//     res.json({ success: true, error: null, components: [] });
//   } catch (err) {
//     const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
//     res.status(500).json({ success: false, error: errorMessage, components: [] });
//   }
// });

// /**
//  * POST /fetch-latest
//  * Retrieves the latest metadata from the org and syncs the local project.
//  */
// router.post('/fetch-latest', async (req, res) => {
//   try {
//     const { projectId, accessToken, orgUrl } = req.projectContext!;

//     const setupResult = await ensureProjectExists({ projectId, orgUrl, accessToken });
//     if (!setupResult.success) {
//       res.status(500).json({ success: false, error: `Project setup failed: ${setupResult.error}`, components: [] });
//       return;
//     }

//     const retrieveResult = await retrieveMetadata(projectId);
//     if (!retrieveResult.success) {
//       res.status(500).json({ success: false, error: `Retrieve failed: ${retrieveResult.error}`, components: [] });
//       return;
//     }

//     res.json({ success: true, error: null, components: [] });
//   } catch (err) {
//     const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
//     res.status(500).json({ success: false, error: errorMessage, components: [] });
//   }
// });

// /**
//  * POST /metadata/objects
//  * Creates a custom object, deploys it, and returns the result.
//  */
// router.post('/objects', async (req, res) => {
//   try {
//     const { projectId, accessToken, orgUrl } = req.projectContext!;
//     const objectSpec: any = req.body;

//     // Step 1: Ensure project exists (lazy init + auth)
//     const setupResult = await ensureProjectExists({
//       projectId,
//       orgUrl,
//       accessToken
//     });

//     if (!setupResult.success) {
//       res.status(500).json({
//         status: false,
//         error: `Project setup failed: ${setupResult.error}`,
//         components: []
//       });
//       return;
//     }

//     // Step 2: Create the custom object
//     const createResult = await createCustomObject(projectId, objectSpec);

//     if (!createResult.success) {
//       res.status(500).json({
//         success: false,
//         error: `Object creation failed: ${createResult.error}`,
//         components: []
//       });
//       return;
//     }

//     // Step 3: Deploy
//     const deployResult = await deployMetadata({
//       projectId,
//       targetOrg: projectId
//     });

//     if (!deployResult.success) {
//       res.status(500).json({
//         success: false,
//         error: `Deployment failed: ${deployResult.error}`,
//         components: [{ fullName: objectSpec.fullName, type: 'CustomObject', xml: createResult.xml! }]
//       });
//       return;
//     }

//     // Step 4: Return success
//     res.json({
//       success: true,
//       error: null,
//       components: [
//         { fullName: objectSpec.fullName, type: 'CustomObject', xml: createResult.xml! }
//       ]
//     });
//   } catch (err) {
//     const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
//     res.status(500).json({
//       status: false,
//       error: errorMessage,
//       components: []
//     });
//   }
// });

// /**
//  * POST /metadata/fields
//  * Creates a custom field on an existing object, deploys it, and returns the result.
//  */
// router.post('/fields', async (req, res) => {
//   try {
//     const { projectId, accessToken, orgUrl } = req.projectContext!;
//     const { objectName, field } = req.body;

//     if (!objectName) {
//       res.status(400).json({
//         status: false,
//         error: 'objectName is required in request body',
//         components: []
//       });
//       return;
//     }

//     if (!field) {
//       res.status(400).json({
//         status: false,
//         error: 'field spec is required in request body',
//         components: []
//       });
//       return;
//     }

//     // Step 1: Ensure project exists
//     const setupResult = await ensureProjectExists({
//       projectId,
//       orgUrl,
//       accessToken
//     });

//     if (!setupResult.success) {
//       res.status(500).json({
//         status: false,
//         error: `Project setup failed: ${setupResult.error}`,
//         components: []
//       });
//       return;
//     }

//     // Step 2: Create the custom field
//     const createResult = await createCustomField(projectId, objectName, field);

//     if (!createResult.success) {
//       res.status(500).json({
//         success: false,
//         error: `Field creation failed: ${createResult.error}`,
//         components: []
//       });
//       return;
//     }

//     // Step 3: Deploy
//     const deployResult = await deployMetadata({
//       projectId,
//       targetOrg: projectId
//     });

//     if (!deployResult.success) {
//       res.status(500).json({
//         success: false,
//         error: `Deployment failed: ${deployResult.error}`,
//         components: [{ fullName: field.fullName, type: 'CustomField', xml: createResult.xml! }]
//       });
//       return;
//     }

//     // Step 4: Return success
//     res.json({
//       success: true,
//       error: null,
//       components: [
//         { fullName: field.fullName, type: 'CustomField', xml: createResult.xml! }
//       ]
//     });
//   } catch (err) {
//     const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
//     res.status(500).json({
//       status: false,
//       error: errorMessage,
//       components: []
//     });
//   }
// });

// /**
//  * GET /metadata/objects
//  * Lists all custom objects for the project.
//  */
// router.get('/objects', async (req, res) => {
//   try {
//     const { projectId, accessToken, orgUrl } = req.projectContext!;

//     // Step 1: Ensure project exists + auth
//     const setupResult = await ensureProjectExists({ projectId, orgUrl, accessToken });
//     if (!setupResult.success) {
//       res.status(500).json({ status: false, error: `Project setup failed: ${setupResult.error}`, components: [] });
//       return;
//     }

//     // Step 2: Retrieve latest from org
//     const retrieveResult = await retrieveMetadata(projectId);
//     if (!retrieveResult.success) {
//       res.status(500).json({ status: false, error: `Retrieve failed: ${retrieveResult.error}`, components: [] });
//       return;
//     }

//     // Step 3: Read from filesystem
//     const projectPath = path.join(process.cwd(), 'projects', projectId, 'force-app', 'main', 'default', 'objects');

//     if (!fs.existsSync(projectPath)) {
//       res.json({ success: true, error: null, components: [] });
//       return;
//     }

//     const entries = fs.readdirSync(projectPath, { withFileTypes: true });
//     const objects = entries
//       .filter(entry => entry.isDirectory())
//       .map(entry => {
//         const objectFilePath = path.join(projectPath, entry.name, `${entry.name}.object-meta.xml`);
//         const exists = fs.existsSync(objectFilePath);
//         const xmlContent = exists ? fs.readFileSync(objectFilePath, 'utf-8') : undefined;
//         return { fullName: entry.name, type: 'CustomObject', xml: xmlContent };
//       });

//     res.json({ status: true, error: null, components: objects });
//   } catch (err) {
//     const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
//     res.status(500).json({ status: false, error: errorMessage, components: [] });
//   }
// });

// /**
//  * GET /metadata/objects/:apiName
//  * Gets a specific custom object by API name.
//  */
// router.get('/objects/:apiName', (req, res) => {
//   try {
//     const { projectId } = req.projectContext!;
//     const { apiName } = req.params;
//     const objectDir = path.join(process.cwd(), 'projects', projectId, 'force-app', 'main', 'default', 'objects', apiName);
//     const objectMetaPath = path.join(objectDir, `${apiName}.object-meta.xml`);

//     if (!fs.existsSync(objectMetaPath)) {
//       res.status(404).json({
//         status: false,
//         error: `Custom object '${apiName}' not found in project '${projectId}'`,
//         components: []
//       });
//       return;
//     }

//     const xmlContent = fs.readFileSync(objectMetaPath, 'utf-8');

//     // List fields on this object
//     const fieldsDir = path.join(objectDir, 'fields');
//     let fields: Array<{ fullName: string; type: string; xml: string }> = [];
//     if (fs.existsSync(fieldsDir)) {
//       fields = fs.readdirSync(fieldsDir)
//         .filter(file => file.endsWith('.field-meta.xml'))
//         .map(file => {
// const fullName = file.replace('.field-meta.xml', '');
// const xml = fs.readFileSync(path.join(fieldsDir, file), 'utf-8');
// return { fullName, type: 'CustomField', xml };
// });
//     }

//     res.json({
//       success: true,
//       error: null,
//       components: [
//         { fullName: apiName, type: 'CustomObject', xml: xmlContent }
//       ],
//       detail: {
//         apiName,
//         xml: xmlContent,
//         fields
//       }
//     });
//   } catch (err) {
//     const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
//     res.status(500).json({
//       status: false,
//       error: errorMessage,
//       components: []
//     });
//   }
// });

// /**
//  * PUT /metadata/objects/:apiName
//  * Updates a custom object by overwriting its XML and redeploying.
//  */
// router.put('/objects/:apiName', async (req, res) => {
//   try {
//     const { projectId, accessToken, orgUrl } = req.projectContext!;
//     const { apiName } = req.params;
//     const objectSpec: any = req.body;

//     if (!objectSpec || !objectSpec.fullName) {
//       res.status(400).json({ status: false, error: 'object spec with fullName is required in request body', components: [] });
//       return;
//     }

//     if (objectSpec.fullName !== apiName) {
//       res.status(400).json({ status: false, error: `fullName in body ('${objectSpec.fullName}') must match URL param ('${apiName}')`, components: [] });
//       return;
//     }

//     // Step 1: Ensure project exists
//     const setupResult = await ensureProjectExists({ projectId, orgUrl, accessToken });
//     if (!setupResult.success) {
//       res.status(500).json({ status: false, error: `Project setup failed: ${setupResult.error}`, components: [] });
//       return;
//     }

//     // Step 2: Validate object exists
//     const objectMetaPath = path.join(process.cwd(), 'projects', projectId, 'force-app', 'main', 'default', 'objects', apiName, `${apiName}.object-meta.xml`);
//     if (!fs.existsSync(objectMetaPath)) {
//       res.status(404).json({ status: false, error: `Custom object '${apiName}' not found in project '${projectId}'`, components: [] });
//       return;
//     }

//     // Step 3: Overwrite (createCustomObject removes existing dir and writes new)
//     const createResult = await createCustomObject(projectId, objectSpec);
//     if (!createResult.success) {
//       res.status(500).json({ status: false, error: `Object update failed: ${createResult.error}`, components: [] });
//       return;
//     }

//     // Step 4: Deploy
//     const deployResult = await deployMetadata({ projectId, targetOrg: projectId });
//     if (!deployResult.success) {
//       res.status(500).json({ status: false, error: `Deployment failed: ${deployResult.error}`, components: [{ fullName: apiName, type: 'CustomObject', xml: createResult.xml! }] });
//       return;
//     }

//     res.json({ success: true, error: null, components: [{ fullName: apiName, type: 'CustomObject', xml: createResult.xml! }] });
//   } catch (err) {
//     const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
//     res.status(500).json({ status: false, error: errorMessage, components: [] });
//   }
// });

// /**
//  * PUT /metadata/fields/:objectName/:fieldName
//  * Updates a custom field by overwriting its XML and redeploying.
//  */
// router.put('/fields/:objectName/:fieldName', async (req, res) => {
//   try {
//     const { projectId, accessToken, orgUrl } = req.projectContext!;
//     const { objectName, fieldName } = req.params;
//     const { field } = req.body;

//     if (!field || !field.fullName) {
//       res.status(400).json({ status: false, error: 'field spec with fullName is required in request body', components: [] });
//       return;
//     }

//     if (field.fullName !== fieldName) {
//       res.status(400).json({ status: false, error: `fullName in body ('${field.fullName}') must match URL param ('${fieldName}')`, components: [] });
//       return;
//     }

//     // Step 1: Ensure project exists
//     const setupResult = await ensureProjectExists({ projectId, orgUrl, accessToken });
//     if (!setupResult.success) {
//       res.status(500).json({ status: false, error: `Project setup failed: ${setupResult.error}`, components: [] });
//       return;
//     }

//     // Step 2: Validate field exists
//     const fieldFilePath = path.join(process.cwd(), 'projects', projectId, 'force-app', 'main', 'default', 'objects', objectName, 'fields', `${fieldName}.field-meta.xml`);
//     if (!fs.existsSync(fieldFilePath)) {
//       res.status(404).json({ status: false, error: `Custom field '${fieldName}' not found on object '${objectName}' in project '${projectId}'`, components: [] });
//       return;
//     }

//     // Step 3: Overwrite
//     const createResult = await createCustomField(projectId, objectName, field);
//     if (!createResult.success) {
//       res.status(500).json({ status: false, error: `Field update failed: ${createResult.error}`, components: [] });
//       return;
//     }

//     // Step 4: Deploy
//     const deployResult = await deployMetadata({ projectId, targetOrg: projectId });
//     if (!deployResult.success) {
//       res.status(500).json({ status: false, error: `Deployment failed: ${deployResult.error}`, components: [{ fullName: fieldName, type: 'CustomField', xml: createResult.xml! }] });
//       return;
//     }

//     res.json({ success: true, error: null, components: [{ fullName: fieldName, type: 'CustomField', xml: createResult.xml! }] });
//   } catch (err) {
//     const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
//     res.status(500).json({ status: false, error: errorMessage, components: [] });
//   }
// });

// /**
//  * DELETE /metadata/objects/:apiName
//  * Deletes a custom object from the Salesforce org and removes local files.
//  */
// router.delete('/objects/:apiName', async (req, res) => {
//   try {
//     const { projectId, accessToken, orgUrl } = req.projectContext!;
//     const { apiName } = req.params;

//     // Step 1: Ensure project exists
//     const setupResult = await ensureProjectExists({ projectId, orgUrl, accessToken });
//     if (!setupResult.success) {
//       res.status(500).json({ status: false, error: `Project setup failed: ${setupResult.error}`, components: [] });
//       return;
//     }

//     // Step 2: Retrieve latest from org to sync local state
//     const retrieveResult = await retrieveMetadata(projectId);
//     if (!retrieveResult.success) {
//       res.status(500).json({ status: false, error: `Retrieve failed: ${retrieveResult.error}`, components: [] });
//       return;
//     }

//     // Step 3: Validate object exists
//     const objectDir = path.join(process.cwd(), 'projects', projectId, 'force-app', 'main', 'default', 'objects', apiName);
//     if (!fs.existsSync(path.join(objectDir, `${apiName}.object-meta.xml`))) {
//       res.status(404).json({ status: false, error: `Custom object '${apiName}' not found in project '${projectId}'`, components: [] });
//       return;
//     }

//     // Step 4: Delete from org via CLI
//     const deleteResult = await deleteMetadata({ projectId, metadataType: 'CustomObject', fullName: apiName });
//     if (!deleteResult.success) {
//       res.status(500).json({ status: false, error: `Delete from org failed: ${deleteResult.error}`, components: [] });
//       return;
//     }

//     // Step 5: Remove local files
//     if (fs.existsSync(objectDir)) {
//       fs.rmSync(objectDir, { recursive: true, force: true });
//     }

//     res.json({ success: true, error: null, components: [{ fullName: apiName, type: 'CustomObject' }] });
//   } catch (err) {
//     const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
//     res.status(500).json({ status: false, error: errorMessage, components: [] });
//   }
// });

// /**
//  * DELETE /metadata/fields/:objectName/:fieldName
//  * Deletes a custom field from the Salesforce org and removes local files.
//  */
// router.delete('/fields/:objectName/:fieldName', async (req, res) => {
//   try {
//     const { projectId, accessToken, orgUrl } = req.projectContext!;
//     const { objectName, fieldName } = req.params;

//     // Step 1: Ensure project exists
//     const setupResult = await ensureProjectExists({ projectId, orgUrl, accessToken });
//     if (!setupResult.success) {
//       res.status(500).json({ status: false, error: `Project setup failed: ${setupResult.error}`, components: [] });
//       return;
//     }

//     // Step 2: Retrieve latest from org to sync local state
//     const retrieveResult = await retrieveMetadata(projectId);
//     if (!retrieveResult.success) {
//       res.status(500).json({ status: false, error: `Retrieve failed: ${retrieveResult.error}`, components: [] });
//       return;
//     }

//     // Step 3: Validate field exists
//     const fieldFilePath = path.join(process.cwd(), 'projects', projectId, 'force-app', 'main', 'default', 'objects', objectName, 'fields', `${fieldName}.field-meta.xml`);
//     if (!fs.existsSync(fieldFilePath)) {
//       res.status(404).json({ status: false, error: `Custom field '${fieldName}' not found on object '${objectName}' in project '${projectId}'`, components: [] });
//       return;
//     }

//     // Step 4: Delete from org via CLI
//     const qualifiedName = `${objectName}.${fieldName}`;
//     const deleteResult = await deleteMetadata({ projectId, metadataType: 'CustomField', fullName: qualifiedName });
//     if (!deleteResult.success) {
//       res.status(500).json({ status: false, error: `Delete from org failed: ${deleteResult.error}`, components: [] });
//       return;
//     }

//     // Step 5: Remove local file
//     if (fs.existsSync(fieldFilePath)) {
//       fs.rmSync(fieldFilePath, { force: true });
//     }

//     res.json({ success: true, error: null, components: [{ fullName: fieldName, type: 'CustomField' }] });
//   } catch (err) {
//     const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
//     res.status(500).json({ status: false, error: errorMessage, components: [] });
//   }
// });

// export default router;
