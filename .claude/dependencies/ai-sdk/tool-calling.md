# AI SDK Tools — Quick Reference

## Anatomy of a Tool

```ts
import { tool } from 'ai';
import { z } from 'zod';

const weatherTool = tool({
  description: 'Get the weather in a location',   // tells the model when to use it
  inputSchema: z.object({
    location: z.string().describe('The location to get the weather for'),
  }),
  execute: async ({ location }) => ({             // runs server-side, returns result
    location,
    temperature: 72,
  }),
});
```

## Using Tools

```ts
import { generateText, streamText, stepCountIs } from 'ai';

const result = await generateText({
  model,
  tools: { weatherTool },
  stopWhen: stepCountIs(5), // allow up to 5 tool call → response cycles
  prompt: 'What is the weather in Lagos?',
});
```

Use `streamText` the same way.

## Key Options

| Option | What it does |
|---|---|
| `strict: true` | Forces model to only produce valid inputs (provider-dependent) |
| `needsApproval: true` | Pauses before executing; returns `tool-approval-request` for your UI to confirm |
| `toolChoice` | `'auto'` (default) · `'required'` · `'none'` · `{ type: 'tool', toolName }` |
| `activeTools` | Limit which tools are available per step |
| `stopWhen` | `stepCountIs(n)` · `hasToolCall(name)` · `isLoopFinished()` |

## Execute's Second Argument

```ts
execute: async (input, { toolCallId, messages, abortSignal }) => { ... }
```

## Multi-Step (Agentic) Flow

The SDK auto-loops: tool call → execute → feed result back → next generation, until `stopWhen` triggers or no more tool calls.

```ts
const { text, steps } = await generateText({ ..., stopWhen: stepCountIs(10) });
const allToolCalls = steps.flatMap(step => step.toolCalls);
```

## Callbacks

```ts
generateText({
  onStepFinish({ stepNumber, toolCalls, toolResults }) { /* log, save */ },
  prepareStep({ stepNumber, messages }) {
    if (stepNumber === 0) return { activeTools: ['weatherTool'] };
  },
});
```

## Error Handling

```ts
import { NoSuchToolError, InvalidToolInputError } from 'ai';

try {
  await generateText({ ... });
} catch (e) {
  if (NoSuchToolError.isInstance(e)) { ... }
  if (InvalidToolInputError.isInstance(e)) { ... }
}
```

For `streamText`, pass `onError` to `toUIMessageStreamResponse` instead.

## Extracting Tools into Files

Always wrap with `tool()` — it preserves TypeScript inference across files.

```ts
// tools/weather.ts
export const weatherTool = tool({ ... });

// route.ts
import { weatherTool } from './tools/weather';
generateText({ tools: { weatherTool }, ... });
```