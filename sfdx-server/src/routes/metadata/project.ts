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
    const { projectId, accessToken, orgUrl } = req.projectContext!;

    const setupResult = await ensureProjectExists({ projectId, orgUrl, accessToken });
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
    const { projectId, accessToken, orgUrl } = req.projectContext!;

    const setupResult = await ensureProjectExists({ projectId, orgUrl, accessToken });
    if (!setupResult.success) {
      res.status(500).json({ success: false, error: `Project setup failed: ${setupResult.error}`, components: [] });
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
    res.status(500).json({ success: false, error: errorMessage, components: [] });
  }
});

export default router;