'use server';

import { createClient } from '@/lib/sfdx/client';

console.log("this is the sfdx server api key", process.env.SFDX_SERVER_API_KEY)
console.log("this is the sfdx server url", process.env.SFDX_SERVER_URL)

const baseUrl = process.env.SFDX_SERVER_URL!
const apiKey = process.env.SFDX_SERVER_API_KEY!

if(!baseUrl || !apiKey) {
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

  console.log("project id", projectId);
  console.log("access token", accessToken);
  console.log("org url", orgUrl);
  
  try {
    const client = getClient( accessToken, projectId, orgUrl);
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
    const client = getClient(accessToken, projectId, orgUrl);
    const result = await client.request('POST', '/metadata/fetch-latest');
    return { success: true, data: result };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Fetch latest failed';
    return { success: false, error: message };
  }
}