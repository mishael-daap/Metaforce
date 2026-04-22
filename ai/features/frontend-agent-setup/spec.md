# Feature: Frontend & Agent Setup

## Purpose
Initialize the Next.js frontend with Vercel AI SDK and a basic chat interface that proves the SDK works with Google Gemini.

## User Flow
1. User navigates to the app
2. Sees a chat interface with Shadcn UI components
3. Types a message in the input field
4. Message is sent to Google Gemini via Vercel AI SDK
5. Gemini responds and the response is displayed in the chat

## Rules
- Must use Google Gemini as the LLM provider
- Must use Vercel AI SDK for chat orchestration
- Must have Shadcn UI components for styling
- Must use Tailwind CSS for all styling
- No Supabase integration yet (deferred to Feature 7)
- No MCP server connection yet (deferred to Feature 2)

## Acceptance Criteria
- [ ] Next.js app runs without errors on `pnpm dev`
- [ ] Chat UI renders with Shadcn components
- [ ] User can send messages
- [ ] Gemini model responds to messages
- [ ] Tailwind CSS styling works
- [ ] Chat history scrolls properly
- [ ] Loading state is shown while waiting for response
