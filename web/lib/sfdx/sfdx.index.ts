import { createClient } from './client';
import { createSfdxToolset } from './tools.index';
import type { SfdxClientConfig } from './types';

/**
 * Creates a fully configured set of Vercel AI SDK tools for interacting
 * with the SFDX Server API. Auth headers are baked in — the agent only
 * needs to pass business-level inputs (object names, field specs, etc.).
 *
 * @example
 * ```ts
 * const tools = createSfdxTools({
 *   baseUrl: process.env.SFDX_BASE_URL!,
 *   apiKey: process.env.SFDX_API_KEY!,
 *   projectId: session.projectId,
 *   accessToken: session.accessToken,
 *   orgUrl: session.orgUrl,
 * });
 *
 * const result = await streamText({
 *   model: anthropic('claude-sonnet-4-5'),
 *   system: getRequirementsPrompt(projectName, projectDescription),
 *   messages,
 *   tools,
 *   stopWhen: stepCountIs(20),
 * });
 * ```
 */
export function createSfdxTools(config: SfdxClientConfig) {
  const client = createClient(config);
  return createSfdxToolset(client);
}

// Re-export types so consumers don't need to dig into internals
export type { SfdxClientConfig, SfdxResponse, ObjectSpec, FieldSpec } from './types';
export type { SfdxToolset } from "./tools.index";
