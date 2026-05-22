import { generateText, stepCountIs } from 'ai';
import { MockLanguageModelV3 } from 'ai/test';
import { createSfdxTools } from "@/lib/sfdx/sfdx.index"

async function main(){
  console.log("kfj;asldjfa;kjsd;fakjsdfkas;jdflk")
  console.log(process.env.SFDX_SERVER_URL, process.env.SFDX_SERVER_API_KEY )

const tools = createSfdxTools({
    baseUrl: "http://localhost:8000",
    apiKey: "password",
    projectId:"hellosuckers",
    accessToken:"00DgK00000FEwjR!AQEAQLsnTH7jyAqyzdhWkUYXyUUOO61_1g7SQIakrM.5tRHJzDda99BxyJqPqr7lvIhr85g8ctAyJa1so3NWfj863Af_dcN6",
    orgUrl:"https://orgfarm-cf567c8e83-dev-ed.develop.my.salesforce.com",
  });

const result = await generateText({
  model: new MockLanguageModelV3({
    doGenerate: async ({ prompt }) => {
      // Inspect what the agent is "thinking" (optional)
      console.log('📨 prompt received:', JSON.stringify(prompt, null, 2));

      return {
        content: [
  {
    type: 'tool-call' as const,
    toolCallId: 'call_1',
    toolName: 'createObject',
    input: JSON.stringify({  // ← must be a string
      fullName: 'Project__c',
      label: 'Project',
      pluralLabel: 'Projects',
      sharingModel: 'ReadWrite',
      visibility: 'Public',
      nameField: { label: 'Project Name', type: 'Text' },
    }),
  },
],
        finishReason: { unified: 'tool-calls' as const, raw: undefined },
        usage: {
          inputTokens: { total: 10, noCache: 10, cacheRead: undefined, cacheWrite: undefined },
          outputTokens: { total: 5, text: 5, reasoning: undefined },
        },
        warnings: [],
      };
    },
  }),
  tools,
  stopWhen: stepCountIs(3),
  prompt: 'Create a Project custom object in Salesforce',
});

console.log('✅ finishReason:', result.finishReason);
console.log('🔧 toolCalls:', JSON.stringify(result.toolCalls, null, 2));
console.log('📦 toolResults:', JSON.stringify(result.toolResults, null, 2));
}

main()