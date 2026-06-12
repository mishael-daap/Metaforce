import { streamText, convertToModelMessages, stepCountIs, tool } from "ai";
import { wrapLanguageModel } from "ai";
import { devToolsMiddleware } from "@ai-sdk/devtools";
import { createOpenAICompatible } from "@ai-sdk/openai-compatible";
import z from "zod";

const nim = createOpenAICompatible({
  name: "nim",
  baseURL: "https://integrate.api.nvidia.com/v1",
  headers: {
    Authorization: `Bearer ${process.env.NIM_API_KEY}`,
  },
});

export const maxDuration = 60;

const baseModel = nim.chatModel("nvidia/nemotron-3-super-120b-a12b");

const slowTool = tool({
  description:
    "This is a test tool, the user might ask you to call it just to test the system.",
  inputSchema: z.object({}),
  execute: async () => {
    const end = Date.now() + 10 * 60 * 1000; // 10 minutes

    while (Date.now() < end) {
      // Busy wait
    }

    return "Finished after 10 minutes";
  },
});

const model =
  process.env.NODE_ENV === "development"
    ? wrapLanguageModel({ model: baseModel, middleware: devToolsMiddleware() })
    : baseModel;

export async function POST(req: Request) {
  const { messages } = await req.json();

  const text = streamText({
    model,
    messages: await convertToModelMessages(messages),
    system: `You are a helpful assistant. you will help users with configuring salesforce.`,
    tools: { slowTool },
    stopWhen: stepCountIs(5),
  });

  return text.toUIMessageStreamResponse();
}
