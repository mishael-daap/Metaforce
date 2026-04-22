# Plan: Frontend & Agent Setup (Roadmap Item #1)

## Context

This is a Salesforce AI Agent system that translates natural language requirements into live Salesforce metadata deployments. The system uses:
- **Frontend**: Next.js with Vercel AI SDK
- **Backend**: MCP (Model Context Protocol) Server
- **Database**: Supabase
- **Integration**: Salesforce CLI

**Current State**: 
- Frontend is a fresh Next.js 16.2.4 scaffold with React 19, Tailwind CSS 4, and TypeScript
- No Vercel AI SDK integration yet
- No chat interface or agent orchestration

**Roadmap Status**: All 9 items are pending. Per `ai/instructions.md`, we start with Item #1: **Frontend & Agent Setup**.

---

## Goal

Initialize the Vercel AI SDK project with a basic chat interface that can:
1. Accept user natural language input
2. Send to an LLM model
3. Display responses
4. Present execution plans for user approval

---

## Implementation Approach

### 1. Add Vercel AI SDK Dependencies
- Install `ai` package (Vercel AI SDK)
- Configure provider (Anthropic Claude)

### 2. Create Chat UI Component
- Basic chat interface with message history
- Input field for requirements
- Display area for AI responses and execution plans

### 3. Set Up AI Route Handler
- API route for streaming chat responses
- Model configuration with Anthropic

### 4. Human-in-the-Loop State Management
- State for tracking approval/verification pauses
- UI controls for approve/reject actions

---

## Critical Files to Modify/Create

- `frontend/package.json` - Add Vercel AI SDK dependency
- `frontend/src/app/api/chat/route.ts` - New API route for AI streaming
- `frontend/src/components/chat.tsx` - New chat interface component
- `frontend/src/app/page.tsx` - Replace default with chat UI
- `.env.local` - API key configuration

---

## Verification

1. `pnpm install` - Dependencies install successfully
2. `pnpm dev` - Dev server starts without errors
3. Chat interface renders at localhost:3000
4. Can send message and receive AI response
5. Execution plan approval UI displays correctly

---

## Next Steps After Approval

1. Confirm Anthropic API key setup
2. Begin with spec.md for this feature per `ai/guides/feature-standards.md`
