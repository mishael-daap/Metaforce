import { 
  convertToModelMessages, 
  streamText, 
  generateText,
  Output,
  UIMessage, 
  createUIMessageStream, 
  createUIMessageStreamResponse,
  NoObjectGeneratedError
} from 'ai';
import { groq } from '@ai-sdk/groq';
import { createMCPClient } from '@ai-sdk/mcp';
import { z } from 'zod';

export const maxDuration = 60;

export const ActionSchema = z.object({
  id: z.string().describe('Unique action identifier e.g. action_1'),
  tool: z.enum(['createObject', 'createField', 'deploy']),
  label: z.string().describe('Human readable description of this step'),
  dependsOn: z.array(z.string()).describe('IDs of actions that must complete first'),
});

export const RequirementSchema = z.object({
  id: z.string().describe('Unique requirement identifier e.g. req_1'),
  name: z.string().describe('Short name for this requirement'),
  description: z.string().describe('Detailed description of what this requirement entails'),
  actions: z.array(ActionSchema).describe('Ordered list of actions to fulfill this requirement'),
});

const ExecutionPlanSchema = z.object({
  requirements_summary: z.string().describe('One sentence summary of all requirements'),
  requirements: z.array(RequirementSchema).describe('List of requirements with their actions'),
});

// --- MCP Client ---

async function createClient(alias: string, instanceUrl: string, accessToken: string) {
  return createMCPClient({
    transport: {
      type: 'http',
      url: process.env.MCP_SERVER_URL || 'http://127.0.0.1:8000/mcp',
      headers: {
        'x-alias': alias,
        'x-instance-url': instanceUrl,
        'x-access-token': accessToken,
      },
    },
  });
}

// --- Handlers ---

async function handlePlan(messages: UIMessage[]) {
  const lastMessage = messages[messages.length - 1];
  const requirements = lastMessage.parts.find(p => p.type === 'text')?.text || '';

  const stream = createUIMessageStream({
    execute: async ({ writer }) => {
      try {
        // Start text stream immediately so start/messageId flush before plan data
        const textResult = streamText({
          model: groq('llama-3.3-70b-versatile'),
          system: [
            'You are a Salesforce configuration assistant.',
            'A structured execution plan has been generated and is displayed to the user.',
            'Write one short sentence acknowledging it, then ask them to click "Approve Plan" to proceed.',
            'Do not describe the plan or provide any manual steps.',
          ].join(' '),
          messages: await convertToModelMessages(messages),
        });

        // Begin merging so start/messageId flush before plan data arrives
        const mergePromise = writer.merge(textResult.toUIMessageStream());

        // Generate plan concurrently — by the time this resolves, start/messageId are already emitted
        const planResult = await generateText({
          model: groq('meta-llama/llama-4-scout-17b-16e-instruct'),
          output: Output.object({
            name: 'ExecutionPlan',
            description: 'A structured Salesforce metadata deployment plan',
            schema: ExecutionPlanSchema,
          }),
          system: [
            'You are a Salesforce configuration assistant.',
            'Given natural language requirements, generate a structured execution plan.',
            'Rules:',
            '- Only use custom objects and custom fields',
            '- Always end with a deploy action',
            '- Objects must be created before their fields (respect dependsOn)',
            '- Topologically sort actions so dependsOn references always point to earlier actions',
            '- Use __c suffix for all custom object and field API names',
          ].join('\n'),
          prompt: requirements,
        }).catch((error) => {
          if (NoObjectGeneratedError.isInstance(error)) {
            console.error('NoObjectGeneratedError');
            console.error('Cause:', error.cause);
            console.error('Text:', error.text);
            console.error('Response:', error.response);
            console.error('Usage:', error.usage);
          } else {
            console.error('Plan generation failed:', error);
          }
          return null;
        });

        // Wait for text stream to finish before writing plan data
        await mergePromise;

        if (planResult?.output) {
          writer.write({
            type: 'data-plan',
            id: 'plan-1',
            data: planResult.output,
          });
        } else {
          writer.write({
            type: 'data-error',
            id: 'plan-error-1',
            data: { message: 'Plan could not be generated. Please try again.' },
          });
        }

      } catch (error) {
        console.error('Unexpected error in handlePlan:', error);
        writer.write({
          type: 'data-error',
          id: 'plan-error-1',
          data: { message: 'An unexpected error occurred. Please try again.' },
        });
      }
    },
  });

  return createUIMessageStreamResponse({ stream });
}

async function handleExecute(messages: UIMessage[], alias: string, instanceUrl: string, accessToken: string) {
  const client = await createClient(alias, instanceUrl, accessToken);

  try {
    const tools = await client.tools();

    const result = streamText({
      model: groq('llama-3.3-70b-versatile'),
      system: 'You are a Salesforce configuration assistant executing a pre-approved plan. Execute the actions using the available tools.',
      tools,
      messages: await convertToModelMessages(messages),
      onError({ error }) {
        console.error('Execute stream error:', error);
      },
    });

    return result.toUIMessageStreamResponse();
  } finally {
    await client.close();
  }
}

async function handleChat(messages: UIMessage[]) {
  const result = streamText({
    model: groq('meta-llama/llama-4-scout-17b-16e-instruct'),
    system: 'You are a Salesforce configuration assistant. Help users translate natural language requirements into Salesforce metadata deployments.',
    messages: await convertToModelMessages(messages),
    onError({ error }) {
      console.error('Chat stream error:', error);
    },
  });

  return result.toUIMessageStreamResponse();
}

// --- Entry Point ---

export async function POST(req: Request) {
  const { messages, mode, alias, instanceUrl, accessToken }: {
    messages: UIMessage[];
    mode: 'plan' | 'execute' | 'chat';
    alias: string;
    instanceUrl: string;
    accessToken: string;
  } = await req.json();

  if (mode === 'plan') return handlePlan(messages);
  if (mode === 'execute') return handleExecute(messages, alias, instanceUrl, accessToken);
  return handleChat(messages);
}