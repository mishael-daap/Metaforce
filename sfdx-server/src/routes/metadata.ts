import { Router } from 'express';
import { ensureProjectExists } from '../services/projectSetup.js';
import { createCustomObject } from '../services/customObject.js';
import { createCustomField } from '../services/customField.js';
import { deployMetadata } from '../services/deploy.js';
import * as fs from 'fs';
import * as path from 'path';

const router = Router();

/**
 * POST /metadata/objects
 * Creates a custom object, deploys it, and returns the result.
 */
router.post('/objects', async (req, res) => {
  try {
    const { projectId, accessToken, orgUrl } = req.projectContext!;
    const objectSpec: any = req.body;

    // Step 1: Ensure project exists (lazy init + auth)
    const setupResult = await ensureProjectExists({
      projectId,
      orgUrl,
      accessToken
    });

    if (!setupResult.success) {
      res.status(500).json({
        status: false,
        error: `Project setup failed: ${setupResult.error}`,
        createdItems: []
      });
      return;
    }

    // Step 2: Create the custom object
    const createResult = await createCustomObject(projectId, objectSpec);

    if (!createResult.success) {
      res.status(500).json({
        status: false,
        error: `Object creation failed: ${createResult.error}`,
        createdItems: []
      });
      return;
    }

    // Step 3: Deploy
    const deployResult = await deployMetadata({
      projectId,
      targetOrg: projectId
    });

    if (!deployResult.success) {
      res.status(500).json({
        status: false,
        error: `Deployment failed: ${deployResult.error}`,
        createdItems: [{ name: objectSpec.fullName, type: 'CustomObject', path: createResult.outputPath! }]
      });
      return;
    }

    // Step 4: Return success
    res.json({
      status: true,
      error: null,
      createdItems: [
        { name: objectSpec.fullName, type: 'CustomObject', path: createResult.outputPath! }
      ]
    });
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
    res.status(500).json({
      status: false,
      error: errorMessage,
      createdItems: []
    });
  }
});

/**
 * POST /metadata/fields
 * Creates a custom field on an existing object, deploys it, and returns the result.
 */
router.post('/fields', async (req, res) => {
  try {
    const { projectId, accessToken, orgUrl } = req.projectContext!;
    const { objectName, field } = req.body;

    if (!objectName) {
      res.status(400).json({
        status: false,
        error: 'objectName is required in request body',
        createdItems: []
      });
      return;
    }

    if (!field) {
      res.status(400).json({
        status: false,
        error: 'field spec is required in request body',
        createdItems: []
      });
      return;
    }

    // Step 1: Ensure project exists
    const setupResult = await ensureProjectExists({
      projectId,
      orgUrl,
      accessToken
    });

    if (!setupResult.success) {
      res.status(500).json({
        status: false,
        error: `Project setup failed: ${setupResult.error}`,
        createdItems: []
      });
      return;
    }

    // Step 2: Create the custom field
    const createResult = await createCustomField(projectId, objectName, field);

    if (!createResult.success) {
      res.status(500).json({
        status: false,
        error: `Field creation failed: ${createResult.error}`,
        createdItems: []
      });
      return;
    }

    // Step 3: Deploy
    const deployResult = await deployMetadata({
      projectId,
      targetOrg: projectId
    });

    if (!deployResult.success) {
      res.status(500).json({
        status: false,
        error: `Deployment failed: ${deployResult.error}`,
        createdItems: [{ name: field.fullName, type: 'CustomField', path: createResult.outputPath! }]
      });
      return;
    }

    // Step 4: Return success
    res.json({
      status: true,
      error: null,
      createdItems: [
        { name: field.fullName, type: 'CustomField', path: createResult.outputPath! }
      ]
    });
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
    res.status(500).json({
      status: false,
      error: errorMessage,
      createdItems: []
    });
  }
});

/**
 * GET /metadata/objects
 * Lists all custom objects for the project.
 */
router.get('/objects', (req, res) => {
  try {
    const { projectId } = req.projectContext!;
    const projectPath = path.join(process.cwd(), 'projects', projectId, 'force-app', 'objects');

    if (!fs.existsSync(projectPath)) {
      res.json({
        status: true,
        error: null,
        createdItems: []
      });
      return;
    }

    const entries = fs.readdirSync(projectPath, { withFileTypes: true });
    const objects = entries
      .filter(entry => entry.isDirectory())
      .map(entry => {
        const objectFilePath = path.join(projectPath, entry.name, `${entry.name}.object-meta.xml`);
        const exists = fs.existsSync(objectFilePath);
        return {
          name: entry.name,
          type: 'CustomObject',
          path: exists ? objectFilePath : undefined
        };
      });

    res.json({
      status: true,
      error: null,
      createdItems: objects
    });
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
    res.status(500).json({
      status: false,
      error: errorMessage,
      createdItems: []
    });
  }
});

/**
 * GET /metadata/objects/:apiName
 * Gets a specific custom object by API name.
 */
router.get('/objects/:apiName', (req, res) => {
  try {
    const { projectId } = req.projectContext!;
    const { apiName } = req.params;
    const objectDir = path.join(process.cwd(), 'projects', projectId, 'force-app', 'objects', apiName);
    const objectMetaPath = path.join(objectDir, `${apiName}.object-meta.xml`);

    if (!fs.existsSync(objectMetaPath)) {
      res.status(404).json({
        status: false,
        error: `Custom object '${apiName}' not found in project '${projectId}'`,
        createdItems: []
      });
      return;
    }

    const xmlContent = fs.readFileSync(objectMetaPath, 'utf-8');

    // List fields on this object
    const fieldsDir = path.join(objectDir, 'fields');
    let fields: string[] = [];
    if (fs.existsSync(fieldsDir)) {
      fields = fs.readdirSync(fieldsDir)
        .filter(file => file.endsWith('.field-meta.xml'))
        .map(file => file.replace('.field-meta.xml', ''));
    }

    res.json({
      status: true,
      error: null,
      createdItems: [
        { name: apiName, type: 'CustomObject', path: objectMetaPath }
      ],
      detail: {
        apiName,
        xml: xmlContent,
        fields
      }
    });
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
    res.status(500).json({
      status: false,
      error: errorMessage,
      createdItems: []
    });
  }
});

export default router;
