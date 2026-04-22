
import { convertToModelMessages, streamText, UIMessage } from 'ai';
import { zai } from 'zhipu-ai-provider'

export const maxDuration = 30;

export async function POST(req: Request) {
  const { messages }: { messages: UIMessage[] } = await req.json();

  const result = streamText({
    model: zai('GLM-4.7-Flash'),
    system: 'You are a helpful assistant.',
    messages: await convertToModelMessages(messages),
  });

  return result.toUIMessageStreamResponse();
}
