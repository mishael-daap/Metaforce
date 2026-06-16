import dotenv from 'dotenv';
dotenv.config();

import { createClient } from '@supabase/supabase-js';
import WebSocket from 'ws';
import express from 'express';
import { startPolling } from './worker/poller.js';
import { ensureProjectExists } from './services/projectSetup.js';
import { retrieveMetadata } from './services/retrieveMetadata.js';

const app = express();
const PORT = process.env.PORT || 8000;
const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  throw new Error("FATAL: API_KEY environment variable is not set. The server cannot start without it.");
}

// ── Supabase client for the worker ─────────────────────
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.warn("[Worker] SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY not set. The worker will not start.");
}

const supabase = SUPABASE_URL && SUPABASE_SERVICE_KEY
  ? createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
      realtime: { transport: WebSocket as any },
    })
  : null;

if (supabase) {
  startPolling(supabase);
  console.log('[Worker] Job polling loop started');
} else {
  console.error('[Worker] Could not start polling loop - Supabase not configured');
}

app.use(express.json());

// ── Middleware ─────────────────────────────────────────

function validateApiKey(req: express.Request, res: express.Response, next: express.NextFunction) {
  const apiKey = req.headers['x-api-key'];

  if (!apiKey) {
    res.status(401).json({
      success: false,
      error: 'Unauthorized: x-api-key header is required',
      components: []
    });
    return;
  }

  if (apiKey !== API_KEY) {
    res.status(401).json({
      success: false,
      error: 'Unauthorized: Invalid API key',
      components: []
    });
    return;
  }

  next();
}

function extractProjectContext(req: express.Request, res: express.Response, next: express.NextFunction) {
  const projectId = req.headers['x-project-id'];

  if (!projectId) {
    res.status(400).json({
      success: false,
      error: 'Bad Request: x-project-id header is required',
      components: []
    });
    return;
  }

  (req as any).projectContext = {
    projectId: String(projectId),
  };

  next();
}

// Apply auth + project context middleware for protected routes
const protectedMiddleware = [validateApiKey, extractProjectContext];

// ── Health check ───────────────────────────────────────

app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ── project-setup ──────────────────────────────────────
/**
 * POST /metadata/project-setup
 * Ensures the SFDX project exists and the org is authenticated.
 */
app.post('/metadata/project-setup', ...protectedMiddleware, async (req, res) => {
  try {
    const projectId = (req as any).projectContext!.projectId;
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

    const setupResult = await ensureProjectExists({
      projectId,
      orgUrl: String(orgUrl),
      accessToken: String(accessToken)
    });

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

// ── fetch-latest ──────────────────────────────────────
/**
 * POST /metadata/fetch-latest
 * Retrieves the latest metadata from the org and syncs the local project.
 */
app.post('/metadata/fetch-latest', ...protectedMiddleware, async (req, res) => {
  try {
    const projectId = (req as any).projectContext!.projectId;

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

app.listen(Number(PORT), '0.0.0.0', () => {
  console.log(`SFDX Server running on http://0.0.0.0:${PORT}`);
  if (supabase) {
    console.log('[Worker] Polling for pending jobs...');
  }
});
