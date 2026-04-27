import { convertToModelMessages, streamText, UIMessage } from 'ai';
import { groq } from '@ai-sdk/groq';
import { createMCPClient } from '@ai-sdk/mcp';

export const maxDuration = 30;

const mcpClients = new Map<string, Awaited<ReturnType<typeof createMCPClient>>>();

async function getMCPClient(alias: string, instanceUrl: string, accessToken: string) {
  const key = `${alias}::${instanceUrl}`;

  if (mcpClients.has(key)) {
    return mcpClients.get(key)!;
  }

  const client = await createMCPClient({
    transport: {
      type: 'http',
      url: process.env.MCP_SERVER_URL || 'http://127.0.0.1:8000/mcp',
      headers: {
        "x-alias": alias,
        "x-instance-url": instanceUrl,
        "x-access-token": accessToken,
      }
    },
  });

  mcpClients.set(key, client);
  return client;
}

export async function POST(req: Request) {
  const { messages, alias, instanceUrl, accessToken }: { messages: UIMessage[]; alias: string; instanceUrl: string; accessToken: string } = await req.json();

  const client = await getMCPClient(alias, instanceUrl, accessToken);
  const tools = await client.tools();

  const result = streamText({
    model: groq('qwen/qwen3-32b'),
    system: 'You are a Salesforce configuration assistant. Help users translate natural language requirements into Salesforce metadata deployments.',
    tools,
    messages: await convertToModelMessages(messages), 
  });

  return result.toUIMessageStreamResponse();
}