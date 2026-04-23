
import { convertToModelMessages, streamText, UIMessage } from 'ai';
import { groq } from '@ai-sdk/groq';

export const maxDuration = 30;

// moonshotai/Kimi-K2-Instruct-0905

export async function POST(req: Request) {
  const { messages }: { messages: UIMessage[] } = await req.json();

  const result = streamText({
    model: groq('qwen/qwen3-32b'),
    system: 'You are a helpful assistant.',
    messages: await convertToModelMessages(messages),
  });

  return result.toUIMessageStreamResponse();
}