# Architecture

## Stack
- Frontend: Next.js (App Router)
- Backend: Next.js API routes + Vercel AI SDK
- Database: Supabase (Postgres + Realtime)
- SFDX Server: Node.js + Salesforce CLI (Docker container)
- Chrome Extension: Vanilla JS / Manifest V3
- Package Manager: pnpm

## System Structure
- **Web App (Next.js):** Chat UI, requirement list, team collaboration
- **Agent Backend (Next.js API):** Orchestrates AI agent, manages requirement state, persists metadata to Supabase
- **SFDX Server:** Stateless Docker service that exposes endpoints for Salesforce CLI operations (e.g. create object, create field). Executes and returns results only — no database access
- **Chrome Extension:** Extracts access token and instance URL from an active Salesforce session and makes them available to the platform
- **Supabase:** Stores all application data and broadcasts real-time updates to collaborators

## Data Flow
User chats → Agent refines requirements → User toggles to Build Mode → Agent creates ephemeral task list for next pending requirement → User approves task list → Agent executes SFDX tools → Agent saves metadata to Supabase linked to requirement → User confirms implementation → Agent marks requirement as complete → Repeat for next requirement

## Application Flow

### Phase 1 — Org Connection
1. User installs the Metaforce Chrome extension
2. User opens their Salesforce org in the browser
3. The extension extracts the active session's access token and instance URL
4. The user connects their org to Metaforce — credentials are saved to Supabase against their project

### Phase 2 — Requirement Gathering
1. User opens the Metaforce chat interface within a project (Plan Mode)
2. User describes their project and requirements in natural language
3. The agent incrementally builds a structured requirements list — adding, removing, and refining items in real time
4. All project collaborators share the same conversation and see updates in real time via Supabase Realtime
5. The user iterates with the agent until the requirements list is complete and approved

### Phase 3 — Build Mode Execution
1. User toggles to Build Mode
2. Agent fetches the next pending requirement
3. Agent creates an ephemeral task list describing the SFDX operations needed to implement the requirement
4. User reviews and approves the task list
5. Agent executes the SFDX tools sequentially to create the required metadata components
6. For each successfully created component, agent saves it to Supabase linked to the requirement
7. Agent asks user to verify the implementation in their Salesforce org
8. On user confirmation, agent marks the requirement as complete
9. Process repeats from step 2 for the next pending requirement until all requirements are complete

### Error Handling (Throughout Build Mode)
- If any SFDX operation fails, the agent diagnoses the error and proposes a fix
- The user reviews and approves the fix
- The agent retries the failed operation
- Execution continues from the point of failure

## Data Model

- **User** — Metaforce account, managed by Supabase Auth. Can belong to many projects.
- **Project** — Top-level container. Groups users, an org, a conversation, and requirements. Has one org and one shared conversation.
- **ProjectUser** — Join table linking users to projects (many-to-many).
- **Org** — A connected Salesforce org. Stores instance URL and access token. Belongs to one project.
- **Conversation** — A single shared, endless chat thread per project. All collaborators read and write to it.
- **Message** — A single chat turn (user or agent). Belongs to a conversation. Persisted for agent history reconstruction and audit trail.
- **Requirement** — A unit of Salesforce work scoped to a project, described in natural language. Ordered and status-tracked (pending / planned / completed / cancelled). Generated from the conversation.
- **MetadataComponent** — A record of a successfully created Salesforce metadata item. Stores name, type, org, and raw XML. Linked to the requirement that created it via requirement_id. Enables reuse across future requirements.

## Key Decisions
- Chrome extension handles org authentication — avoids OAuth complexity and AppExchange dependency
- SFDX Server is stateless — it executes and returns; all persistence is handled by the agent backend
- Vercel AI SDK manages agent streaming and tool calling
- One shared conversation per project — enforces a single source of truth for requirements across collaborators
- Supabase Realtime broadcasts requirement status to all project members
- Each requirement is approved as a whole and retried on error before proceeding to the next

## Constraints
- SFDX Server must run as a separate Docker container
- No direct Supabase access from the SFDX Server
- One org per project
- POC restricted to custom objects and fields