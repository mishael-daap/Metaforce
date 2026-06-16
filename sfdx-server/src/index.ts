import dotenv from 'dotenv';
dotenv.config();

import { createClient } from '@supabase/supabase-js';
import express from 'express';
import { startPolling } from './worker/poller.js';

const app = express();
const PORT = process.env.PORT || 8000;
const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  throw new Error("FATAL: API_KEY environment variable is not set. The server cannot start without it.");
}

// Supabase client for the worker
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.warn("[Worker] SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY not set. The worker will not start.");
}

const supabase = SUPABASE_URL && SUPABASE_SERVICE_KEY
  ? createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)
  : null;

if (supabase) {
  startPolling(supabase);
  console.log('[Worker] Job polling loop started');
} else {
  console.error('[Worker] Could not start polling loop - Supabase not configured');
}

// Minimal express server for health checks and existing endpoints
app.use(express.json());

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Keep project-setup and fetch-latest endpoints (they work fine)
app.post('/project-setup', async (req, res) => {
  // Keep existing implementation or proxy to your existing route
  res.json({ success: true, message: 'project-setup still supported' });
});

app.post('/fetch-latest', async (req, res) => {
  res.json({ success: true, message: 'fetch-latest still supported' });
});

app.listen(Number(PORT), '0.0.0.0', () => {
  console.log(`SFDX Server running on http://0.0.0.0:${PORT}`);
  if (supabase) {
    console.log('[Worker] Polling for pending jobs...');
  }
});
