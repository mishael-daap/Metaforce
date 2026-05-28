import { generateText, stepCountIs } from 'ai';
import { MockLanguageModelV3 } from 'ai/test';
import { createSfdxTools } from "@/lib/sfdx/sfdx.index";

async function main() {
  const tools = createSfdxTools({
    baseUrl: "http://localhost:8000",
    apiKey: "password",
    projectId: "2a30440f-677a-48d6-906a-b4df6c5e4e43",
  });

  // Option 1: call the tool directly — skips the model entirely
  console.log("\n--- Direct tool call ---");
  try {
    // @ts-expect-error — accessing execute directly for testing
const result = await tools.listObjects.execute({}, { toolCallId: "test", messages: [] });
    console.log("✅ listObjects result:", JSON.stringify(result, null, 2));
  } catch (err) {
    console.error("❌ listObjects error:", err);
  }

  // Option 2: through the mock model — verifies the full pipeline
  console.log("\n--- Through mock model ---");
  const result = await generateText({
    model: new MockLanguageModelV3({
      doGenerate: async () => ({
        content: [
          {
            type: 'tool-call' as const,
            toolCallId: 'call_1',
            toolName: 'listObjects',
            input: JSON.stringify({}),  // listObjects takes no input
          },
        ],
        finishReason: { unified: 'tool-calls' as const, raw: undefined },
        usage: {
          inputTokens: { total: 10, noCache: 10, cacheRead: undefined, cacheWrite: undefined },
          outputTokens: { total: 5, text: 5, reasoning: undefined },
        },
        warnings: [],
      }),
    }),
    tools,
    stopWhen: stepCountIs(2),
    prompt: 'List all objects',
  });

  console.log('🔧 toolResults:', JSON.stringify(result.toolResults, null, 2));
}

main();