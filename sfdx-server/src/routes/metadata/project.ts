import { Router } from 'express';
import { ensureProjectExists } from '../../services/projectSetup.js';
import { retrieveMetadata } from '../../services/retrieveMetadata.js';

const router = Router();

/**
 * POST /project-setup
 * Ensures the SFDX project exists and the org is authenticated.
 */
router.post('/project-setup', async (req, res) => {
  try {
    const projectId = req.projectContext!.projectId;
    const accessToken = req.headers['x-access-token'];
    const orgUrl = req.headers['x-org-url'];

    if (!accessToken) {
      res.status(400).json({
        success: false,
        error: 'Bad Request: x-access-token header is required',
        components: []
      });
      return;
    }

    if (!orgUrl) {
      res.status(400).json({
        success: false,
        error: 'Bad Request: x-org-url header is required',
        components: []
      });
      return;
    }

    const setupResult = await ensureProjectExists({ projectId, orgUrl: String(orgUrl), accessToken: String(accessToken) });
    if (!setupResult.success) {
      res.status(500).json({ success: false, error: `Project setup failed: ${setupResult.error}`, components: [] });
      return;
    }

    res.json({ success: true, error: null, components: [] });
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
    res.status(500).json({ success: false, error: errorMessage, components: [] });
  }
});

/**
 * POST /fetch-latest
 * Retrieves the latest metadata from the org and syncs the local project.
 */
router.post('/fetch-latest', async (req, res) => {
  try {
    const projectId = req.projectContext!.projectId;
    const accessToken = req.headers['x-access-token'];
    const orgUrl = req.headers['x-org-url'];

    if (!accessToken) {
      res.status(400).json({
        success: false,
        error: 'Bad Request: x-access-token header is required',
        components: []
      });
      return;
    }

    if (!orgUrl) {
      res.status(400).json({
        success: false,
        error: 'Bad Request: x-org-url header is required',
        components: []
      });
      return;
    }

    const retrieveResult = await retrieveMetadata(projectId);
    if (!retrieveResult.success) {
      res.status(500).json({ success: false, error: `Retrieve failed: ${retrieveResult.error}`, components: [] });
      return;
    }

    res.json({ success: true, error: null, components: [] });
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
    res.status(500).json({ success: false, error: errorMessage + ' Hint: Run POST /project-setup to set up and authenticate the project.', components: [] });
  }
});

export default router;