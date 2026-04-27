import { convertToModelMessages, streamText, UIMessage } from 'ai';
import { groq } from '@ai-sdk/groq';
import { createMCPClient } from '@ai-sdk/mcp';

export const maxDuration = 30;

let mcpClient: Awaited<ReturnType<typeof createMCPClient>> | null = null;

async function getMCPClient() {
  if (mcpClient) {
    return mcpClient;
  }

  mcpClient = await createMCPClient({
    transport: {
      type: 'http',
      url: 'http://127.0.0.1:8000/mcp',
      headers: {
        "x-alias": "the-new-project",   // from the modal form
        "x-instance-url": "https://orgfarm-cf567c8e83-dev-ed.develop.my.salesforce.com",   // from the modal form
        "x-access-token": "***REMOVED***"
      }
    },
  });

  return mcpClient;
}

export async function POST(req: Request) {
  const { messages }: { messages: UIMessage[] } = await req.json();

  const client = await getMCPClient();
  const tools = await client.tools();

  const result = streamText({
    model: groq('qwen/qwen3-32b'),
    system: 'You are a Salesforce configuration assistant. Help users translate natural language requirements into Salesforce metadata deployments.',
    tools,
    messages: await convertToModelMessages(messages), 
  });

  return result.toUIMessageStreamResponse();
}