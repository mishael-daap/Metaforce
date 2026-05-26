'use server';

import { createClient } from '@/lib/sfdx/client';

const baseUrl = process.env.SFDX_SERVER_URL!
const apiKey = process.env.SFDX_SERVER_API_KEY!

if (!baseUrl || !apiKey) {
  console.error("SFDX server configuration is missing");
  throw new Error("SFDX server configuration is missing");
}

function getClient(projectId: string, accessToken: string, orgUrl: string) {
  return createClient({
    baseUrl,
    apiKey,
    projectId,
    accessToken,
    orgUrl
  });
}

export async function setupProject(
  projectId: string,
  accessToken: string,
  orgUrl: string
) {
  try {
    // FIX: Correct argument order — projectId first, then accessToken
    const client = getClient(projectId, accessToken, orgUrl);
    const result = await client.request('POST', '/metadata/project-setup');
    return { success: true, data: result };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Project setup failed';
    return { success: false, error: message };
  }
}

export async function fetchLatest(
  projectId: string,
  accessToken: string,
  orgUrl: string
) {
  try {
    // FIX: Correct argument order here too
    const client = getClient(projectId, accessToken, orgUrl);
    const result = await client.request('POST', '/metadata/fetch-latest');
    return { success: true, data: result };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Fetch latest failed';
    return { success: false, error: message };
  }
}