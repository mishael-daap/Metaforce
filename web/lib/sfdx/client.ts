import type { SfdxClientConfig, SfdxResponse } from './types';

export function createClient(config: SfdxClientConfig) {
  const { baseUrl, apiKey, projectId, accessToken, orgUrl } = config;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'x-api-key': apiKey,
    'x-project-id': projectId,
    'x-access-token': accessToken,
    'x-org-url': orgUrl,
  };

  async function request(
    method: 'GET' | 'POST' | 'PUT' | 'DELETE',
    path: string,
    body?: unknown,
  ): Promise<SfdxResponse> {
    const url = `${baseUrl}${path}`;

    const res = await fetch(url, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });

    const data = (await res.json()) as SfdxResponse;

    // Surface API-level errors as thrown errors so the agent
    // receives a clear failure message via the tool result
    if (!data.success) {
      throw new Error(data.error ?? `SFDX API error on ${method} ${path}`);
    }

    return data;
  }

  return { request };
}

export type SfdxClient = ReturnType<typeof createClient>;