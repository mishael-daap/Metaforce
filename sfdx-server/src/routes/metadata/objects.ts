import { Router } from 'express';
import { ensureProjectExists } from '../../services/projectSetup.js';
import { createCustomObject } from '../../services/customObject.js';
import { deployMetadata } from '../../services/deploy.js';
import { deleteMetadata } from '../../services/deleteMetadata.js';
import * as fs from 'fs';
import * as path from 'path';

const router = Router();

/**
 * GET /metadata/objects
 * Lists all custom objects for the project.
 */
router.get('/', async (req, res) => {
  try {
    const { projectId, accessToken, orgUrl } = req.projectContext!;

    const setupResult = await ensureProjectExists({ projectId, orgUrl, accessToken });
    if (!setupResult.success) {
      res.status(500).json({ status: false, error: `Project setup failed: ${setupResult.error}`, components: [] });
      return;
    }

    const projectPath = path.join(
      process.cwd(), 'projects', projectId,
      'force-app', 'main', 'default', 'objects'
    );

    if (!fs.existsSync(projectPath)) {
      res.json({ success: true, error: null, components: [] });
      return;
    }

    const entries = fs.readdirSync(projectPath, { withFileTypes: true });
    const objects = entries
      .filter(entry => entry.isDirectory())
      .map(entry => {
        const objectFilePath = path.join(projectPath, entry.name, `${entry.name}.object-meta.xml`);
        const exists = fs.existsSync(objectFilePath);
        const xmlContent = exists ? fs.readFileSync(objectFilePath, 'utf-8') : undefined;
        return { fullName: entry.name, type: 'CustomObject', xml: xmlContent };
      });

    res.json({ status: true, error: null, components: objects });
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
    res.status(500).json({ status: false, error: errorMessage, components: [] });
  }
});

/**
 * POST /metadata/objects
 * Creates a custom object, deploys it, and returns the result.
 */
router.post('/', async (req, res) => {
  try {
    const { projectId, accessToken, orgUrl } = req.projectContext!;
    const objectSpec: any = req.body;

    const setupResult = await ensureProjectExists({ projectId, orgUrl, accessToken });
    if (!setupResult.success) {
      res.status(500).json({ status: false, error: `Project setup failed: ${setupResult.error}`, components: [] });
      return;
    }

    const createResult = await createCustomObject(projectId, objectSpec);
    if (!createResult.success) {
      res.status(500).json({ success: false, error: `Object creation failed: ${createResult.error}`, components: [] });
      return;
    }

    const deployResult = await deployMetadata({ projectId, targetOrg: projectId });
    if (!deployResult.success) {
      res.status(500).json({
        success: false,
        error: `Deployment failed: ${deployResult.error}`,
        components: [{ fullName: objectSpec.fullName, type: 'CustomObject', xml: createResult.xml! }]
      });
      return;
    }

    res.json({
      success: true,
      error: null,
      components: [{ fullName: objectSpec.fullName, type: 'CustomObject', xml: createResult.xml! }]
    });
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
    res.status(500).json({ status: false, error: errorMessage, components: [] });
  }
});

/**
 * GET /metadata/objects/:apiName
 * Gets a specific custom object by API name.
 */
router.get('/:apiName', (req, res) => {
  try {
    const { projectId } = req.projectContext!;
    const { apiName } = req.params;

    const objectDir = path.join(
      process.cwd(), 'projects', projectId,
      'force-app', 'main', 'default', 'objects', apiName
    );
    const objectMetaPath = path.join(objectDir, `${apiName}.object-meta.xml`);

    if (!fs.existsSync(objectMetaPath)) {
      res.status(404).json({
        status: false,
        error: `Custom object '${apiName}' not found in project '${projectId}'`,
        components: []
      });
      return;
    }

    const xmlContent = fs.readFileSync(objectMetaPath, 'utf-8');

    const fieldsDir = path.join(objectDir, 'fields');
    let fields: Array<{ fullName: string; type: string; xml: string }> = [];
    if (fs.existsSync(fieldsDir)) {
      fields = fs.readdirSync(fieldsDir)
        .filter(file => file.endsWith('.field-meta.xml'))
        .map(file => {
          const fullName = file.replace('.field-meta.xml', '');
          const xml = fs.readFileSync(path.join(fieldsDir, file), 'utf-8');
          return { fullName, type: 'CustomField', xml };
        });
    }

    res.json({
      success: true,
      error: null,
      components: [{ fullName: apiName, type: 'CustomObject', xml: xmlContent }],
      detail: { apiName, xml: xmlContent, fields }
    });
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
    res.status(500).json({ status: false, error: errorMessage, components: [] });
  }
});

/**
 * PUT /metadata/objects/:apiName
 * Updates a custom object by overwriting its XML and redeploying.
 */
router.put('/:apiName', async (req, res) => {
  try {
    const { projectId, accessToken, orgUrl } = req.projectContext!;
    const { apiName } = req.params;
    const objectSpec: any = req.body;

    if (!objectSpec || !objectSpec.fullName) {
      res.status(400).json({ status: false, error: 'object spec with fullName is required in request body', components: [] });
      return;
    }

    if (objectSpec.fullName !== apiName) {
      res.status(400).json({
        status: false,
        error: `fullName in body ('${objectSpec.fullName}') must match URL param ('${apiName}')`,
        components: []
      });
      return;
    }

    const setupResult = await ensureProjectExists({ projectId, orgUrl, accessToken });
    if (!setupResult.success) {
      res.status(500).json({ status: false, error: `Project setup failed: ${setupResult.error}`, components: [] });
      return;
    }

    const objectMetaPath = path.join(
      process.cwd(), 'projects', projectId,
      'force-app', 'main', 'default', 'objects', apiName, `${apiName}.object-meta.xml`
    );
    if (!fs.existsSync(objectMetaPath)) {
      res.status(404).json({
        status: false,
        error: `Custom object '${apiName}' not found in project '${projectId}'`,
        components: []
      });
      return;
    }

    const createResult = await createCustomObject(projectId, objectSpec);
    if (!createResult.success) {
      res.status(500).json({ status: false, error: `Object update failed: ${createResult.error}`, components: [] });
      return;
    }

    const deployResult = await deployMetadata({ projectId, targetOrg: projectId });
    if (!deployResult.success) {
      res.status(500).json({
        status: false,
        error: `Deployment failed: ${deployResult.error}`,
        components: [{ fullName: apiName, type: 'CustomObject', xml: createResult.xml! }]
      });
      return;
    }

    res.json({
      success: true,
      error: null,
      components: [{ fullName: apiName, type: 'CustomObject', xml: createResult.xml! }]
    });
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
    res.status(500).json({ status: false, error: errorMessage, components: [] });
  }
});

/**
 * DELETE /metadata/objects/:apiName
 * Deletes a custom object from the Salesforce org and removes local files.
 */
router.delete('/:apiName', async (req, res) => {
  try {
    const { projectId, accessToken, orgUrl } = req.projectContext!;
    const { apiName } = req.params;

    const setupResult = await ensureProjectExists({ projectId, orgUrl, accessToken });
    if (!setupResult.success) {
      res.status(500).json({ status: false, error: `Project setup failed: ${setupResult.error}`, components: [] });
      return;
    }

    const objectDir = path.join(
      process.cwd(), 'projects', projectId,
      'force-app', 'main', 'default', 'objects', apiName
    );
    if (!fs.existsSync(path.join(objectDir, `${apiName}.object-meta.xml`))) {
      res.status(404).json({
        status: false,
        error: `Custom object '${apiName}' not found in project '${projectId}'`,
        components: []
      });
      return;
    }

    const deleteResult = await deleteMetadata({ projectId, metadataType: 'CustomObject', fullName: apiName });
    if (!deleteResult.success) {
      res.status(500).json({ status: false, error: `Delete from org failed: ${deleteResult.error}`, components: [] });
      return;
    }

    if (fs.existsSync(objectDir)) {
      fs.rmSync(objectDir, { recursive: true, force: true });
    }

    res.json({ success: true, error: null, components: [{ fullName: apiName, type: 'CustomObject' }] });
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
    res.status(500).json({ status: false, error: errorMessage, components: [] });
  }
});

export default router;