import { Router } from 'express';
import { ensureProjectExists } from '../../services/projectSetup.js';
import { createCustomField } from '../../services/customField.js';
import { deployMetadata } from '../../services/deploy.js';
import { deleteMetadata } from '../../services/deleteMetadata.js';
import * as fs from 'fs';
import * as path from 'path';

const router = Router();

/**
 * POST /metadata/fields
 * Creates a custom field on an existing object, deploys it, and returns the result.
 */
router.post('/', async (req, res) => {
  try {
    const { projectId, accessToken, orgUrl } = req.projectContext!;
    const { objectName, field } = req.body;

    if (!objectName) {
      res.status(400).json({ status: false, error: 'objectName is required in request body', components: [] });
      return;
    }

    if (!field) {
      res.status(400).json({ status: false, error: 'field spec is required in request body', components: [] });
      return;
    }

    const setupResult = await ensureProjectExists({ projectId, orgUrl, accessToken });
    if (!setupResult.success) {
      res.status(500).json({ status: false, error: `Project setup failed: ${setupResult.error}`, components: [] });
      return;
    }

    const createResult = await createCustomField(projectId, objectName, field);
    if (!createResult.success) {
      res.status(500).json({ success: false, error: `Field creation failed: ${createResult.error}`, components: [] });
      return;
    }

    const deployResult = await deployMetadata({ projectId, targetOrg: projectId });
    if (!deployResult.success) {
      res.status(500).json({
        success: false,
        error: `Deployment failed: ${deployResult.error}`,
        components: [{ fullName: field.fullName, type: 'CustomField', xml: createResult.xml! }]
      });
      return;
    }

    res.json({
      success: true,
      error: null,
      components: [{ fullName: field.fullName, type: 'CustomField', xml: createResult.xml! }]
    });
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
    res.status(500).json({ status: false, error: errorMessage, components: [] });
  }
});

/**
 * PUT /metadata/fields/:objectName/:fieldName
 * Updates a custom field by overwriting its XML and redeploying.
 */
router.put('/:objectName/:fieldName', async (req, res) => {
  try {
    const { projectId, accessToken, orgUrl } = req.projectContext!;
    const { objectName, fieldName } = req.params;
    const { field } = req.body;

    if (!field || !field.fullName) {
      res.status(400).json({ status: false, error: 'field spec with fullName is required in request body', components: [] });
      return;
    }

    if (field.fullName !== fieldName) {
      res.status(400).json({
        status: false,
        error: `fullName in body ('${field.fullName}') must match URL param ('${fieldName}')`,
        components: []
      });
      return;
    }

    const setupResult = await ensureProjectExists({ projectId, orgUrl, accessToken });
    if (!setupResult.success) {
      res.status(500).json({ status: false, error: `Project setup failed: ${setupResult.error}`, components: [] });
      return;
    }

    const fieldFilePath = path.join(
      process.cwd(), 'projects', projectId,
      'force-app', 'main', 'default', 'objects',
      objectName, 'fields', `${fieldName}.field-meta.xml`
    );
    if (!fs.existsSync(fieldFilePath)) {
      res.status(404).json({
        status: false,
        error: `Custom field '${fieldName}' not found on object '${objectName}' in project '${projectId}'`,
        components: []
      });
      return;
    }

    const createResult = await createCustomField(projectId, objectName, field);
    if (!createResult.success) {
      res.status(500).json({ status: false, error: `Field update failed: ${createResult.error}`, components: [] });
      return;
    }

    const deployResult = await deployMetadata({ projectId, targetOrg: projectId });
    if (!deployResult.success) {
      res.status(500).json({
        status: false,
        error: `Deployment failed: ${deployResult.error}`,
        components: [{ fullName: fieldName, type: 'CustomField', xml: createResult.xml! }]
      });
      return;
    }

    res.json({
      success: true,
      error: null,
      components: [{ fullName: fieldName, type: 'CustomField', xml: createResult.xml! }]
    });
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
    res.status(500).json({ status: false, error: errorMessage, components: [] });
  }
});

/**
 * DELETE /metadata/fields/:objectName/:fieldName
 * Deletes a custom field from the Salesforce org and removes local files.
 */
router.delete('/:objectName/:fieldName', async (req, res) => {
  try {
    const { projectId, accessToken, orgUrl } = req.projectContext!;
    const { objectName, fieldName } = req.params;

    const setupResult = await ensureProjectExists({ projectId, orgUrl, accessToken });
    if (!setupResult.success) {
      res.status(500).json({ status: false, error: `Project setup failed: ${setupResult.error}`, components: [] });
      return;
    }

    const fieldFilePath = path.join(
      process.cwd(), 'projects', projectId,
      'force-app', 'main', 'default', 'objects',
      objectName, 'fields', `${fieldName}.field-meta.xml`
    );
    if (!fs.existsSync(fieldFilePath)) {
      res.status(404).json({
        status: false,
        error: `Custom field '${fieldName}' not found on object '${objectName}' in project '${projectId}'`,
        components: []
      });
      return;
    }

    const qualifiedName = `${objectName}.${fieldName}`;
    const deleteResult = await deleteMetadata({ projectId, metadataType: 'CustomField', fullName: qualifiedName });
    if (!deleteResult.success) {
      res.status(500).json({ status: false, error: `Delete from org failed: ${deleteResult.error}`, components: [] });
      return;
    }

    if (fs.existsSync(fieldFilePath)) {
      fs.rmSync(fieldFilePath, { force: true });
    }

    res.json({ success: true, error: null, components: [{ fullName: fieldName, type: 'CustomField' }] });
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
    res.status(500).json({ status: false, error: errorMessage, components: [] });
  }
});

export default router;