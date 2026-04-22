# Technical Plan

## Components
- `/frontend` - Next.js app with Vercel AI SDK
- `/frontend/app` - App router pages
- `/frontend/components/ui` - Shadcn UI components (auto-generated)
- `/frontend/components/chat` - Chat interface components

## Stack
- Next.js 14+ (App Router)
- Vercel AI SDK (`@ai-sdk/google`, `ai`)
- Tailwind CSS
- Shadcn UI
- pnpm (package manager)

## API
- Route: `POST /api/chat`
  - Input: `{ messages: Array<{ role: string, content: string }> }`
  - Output: Streaming text response from Gemini

## Data Model
None for this feature (Supabase deferred to Feature 7)

## Flow
```
User Input → useChat hook → /api/chat route → Google Gemini API → Stream Response → UI
```

## Environment Variables
- `GOOGLE_GENERATIVE_AI_API_KEY` - Gemini API key

## Notes
- No Supabase yet (deferred to Feature 7)
- No MCP server connection yet (Feature 2)
- Simple chat-only proof of concept
- Use Shadcn's pre-built components where applicable
