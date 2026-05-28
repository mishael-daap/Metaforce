
import { streamText, convertToModelMessages, stepCountIs } from "ai";
import { wrapLanguageModel } from "ai";
import { devToolsMiddleware } from "@ai-sdk/devtools";
import { createOpenAICompatible } from "@ai-sdk/openai-compatible";

const nim = createOpenAICompatible({
  name: "nim",
  baseURL: "https://integrate.api.nvidia.com/v1",
  headers: {
    Authorization: `Bearer ${process.env.NIM_API_KEY}`,
  },
});

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

const baseModel = nim.chatModel("nvidia/nemotron-3-super-120b-a12b");

const model = process.env.NODE_ENV === "development"
  ? wrapLanguageModel({ model: baseModel, middleware: devToolsMiddleware() })
  : baseModel;

export async function POST(req: Request) {
  const { messages } = await req.json();

  const text = streamText({
    model,
    messages: await convertToModelMessages(messages),
     system: `You are a helpful assistant. you will help users with configuring salesforce.`,
    stopWhen: stepCountIs(5),
  });

  return text.toUIMessageStreamResponse();
}
