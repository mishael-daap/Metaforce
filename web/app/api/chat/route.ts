import { groq } from "@ai-sdk/groq";
import { streamText, convertToModelMessages, stepCountIs } from "ai";
import { wrapLanguageModel } from "ai";
import { devToolsMiddleware } from "@ai-sdk/devtools";

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

const model = wrapLanguageModel({
  model:groq("meta-llama/llama-4-scout-17b-16e-instruct"),
  middleware: devToolsMiddleware()
})

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
