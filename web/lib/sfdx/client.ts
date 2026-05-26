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

  console.log('[SFDX Request]', {
    method,
    url,
    headers: {
      ...headers,
      'x-access-token': '***masked***',
    },
    body,
  });

  const res = await fetch(url, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  console.log('[SFDX Response Status]', res.status, res.statusText);

  // Read body ONCE as text
  const rawText = await res.text();
  console.log('[SFDX Raw Response]', rawText);

  let data: SfdxResponse;
  try {
    data = JSON.parse(rawText) as SfdxResponse;
  } catch {
    throw new Error(`SFDX server returned non-JSON: ${rawText.slice(0, 200)}`);
  }

  console.log('[SFDX Parsed]', data);

  if (!data.success) {
    throw new Error(data.error ?? `SFDX API error on ${method} ${path}`);
  }

  return data;
}

  return { request };
}

export type SfdxClient = ReturnType<typeof createClient>;