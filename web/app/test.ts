import { generateText, tool } from 'ai';
import { MockLanguageModelV3 } from 'ai/test';
import { z } from 'zod';
import { createSfdxTools } from '@/lib/tools/sfdx';

const sfdxTools = createSfdxTools({
  projectId: "mock-project",
  accessToken: "mock-token",
  orgUrl: "https://mock.salesforce.com"
});


async function main() {
  console.log('🚀 Starting test...');

  const result = await generateText({
    model: new MockLanguageModelV3({
      doGenerate: async () => {
        console.log('🤖 doGenerate called');
        return {
          content: [
            {
              type: 'tool-call' as const,
              toolCallId: 'call_1',
              toolName: 'createObject',
              // ✅ plain object, not JSON.stringify
              args: {
                fullName: 'Project__c',
                label: 'Project',
                pluralLabel: 'Projects',
                sharingModel: 'ReadWrite',
                visibility: 'Public',
                nameField: { label: 'Project Name', type: 'Text' },
              },
            },
          ],
          // ✅ plain string, not { unified, raw }
          finishReason: 'tool-calls' as const,
          // ✅ flat shape expected by MockLanguageModelV3
          usage: {
            promptTokens: 10,
            completionTokens: 5,
          },
          warnings: [],
        };
      },
    }),
    tools: {
      createObject: tool({
        description: sfdxTools.createObject.description,
        // ✅ pass the Zod schema directly — no zodSchema() wrapper
        inputSchema: sfdxTools.createObject.inputSchema,
        execute: async (args) => {
          console.log('🔧 execute called with:', JSON.stringify(args, null, 2));
          return { success: true, message: 'Object created (mocked)', args };
        },
      }),
    },
    prompt: 'Create a Project custom object in Salesforce',
  });

  console.log('\n📊 --- RESULTS ---');
  console.log('finishReason:', result.finishReason);
  console.log('toolCalls:', JSON.stringify(result.toolCalls, null, 2));
  console.log('toolResults:', JSON.stringify(result.toolResults, null, 2));
}

main().catch((err) => {
  console.error('💥 Error:', err);
});