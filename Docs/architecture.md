# Architecture

## Stack
- Frontend: Next.js (App Router)
- Backend: Next.js API routes + Vercel AI SDK
- Database: Supabase (Postgres + Realtime)
- SFDX Server: Node.js + Salesforce CLI (Docker container)
- Chrome Extension: Vanilla JS / Manifest V3
- Package Manager: pnpm

## System Structure
- **Web App (Next.js):** Chat UI, requirement list, action plan view, execution progress, team collaboration
- **Agent Backend (Next.js API):** Orchestrates AI agent, manages requirement and action state, persists metadata to Supabase
- **SFDX Server:** Stateless Docker service that exposes endpoints for Salesforce CLI operations (e.g. create object, create field). Executes and returns results only — no database access
- **Chrome Extension:** Extracts access token and instance URL from an active Salesforce session and makes them available to the platform
- **Supabase:** Stores all application data and broadcasts real-time updates to collaborators

## Data Flow
User chats → Agent refines requirements → User executes → Agent calls SFDX Server → SFDX Server runs CLI command → Returns result to Agent Backend → Agent saves metadata to Supabase → Action marked complete → Next action begins

## Application Flow

### Phase 1 — Org Connection
1. User installs the Metaforce Chrome extension
2. User opens their Salesforce org in the browser
3. The extension extracts the active session's access token and instance URL
4. The user connects their org to Metaforce — credentials are saved to Supabase against their project

### Phase 2 — Requirement Gathering
1. User opens the Metaforce chat interface within a project
2. User describes their project and requirements in natural language
3. The agent incrementally builds a structured requirements list — adding, removing, and refining items in real time
4. All project collaborators share the same conversation and see updates in real time via Supabase Realtime
5. The user iterates with the agent until the requirements list is complete and approved

### Phase 3 — Action Planning
1. User clicks Execute on the first requirement
2. The requirement expands on screen, revealing a list of granular actions the agent will perform (e.g. create custom object, add field)
3. The user reviews the action plan
4. The user either approves the plan or requests changes
5. The agent updates the plan accordingly — steps 3–4 repeat until the user is satisfied
6. User clicks Execute to begin action execution

### Phase 4 — Action Execution
1. The agent executes actions sequentially, one at a time
2. For each action, the agent calls the relevant SFDX Server endpoint (e.g. create custom object)
3. The SFDX Server runs the corresponding Salesforce CLI command against the connected org
4. On success: the agent saves the metadata component to Supabase and marks the action as complete
5. The next action begins automatically

### Phase 5 — Error Recovery
1. If an action fails, the agent pauses execution
2. The agent diagnoses the error and proposes a fix, displaying the recommended change to the user
3. The user reviews and approves the fix
4. The agent updates the action and retries it
5. Execution resumes from that action

### Phase 6 — Requirement Verification
1. Once all actions for a requirement are complete, the user verifies the changes in their Salesforce org
2. The user marks the requirement as complete
3. The next requirement automatically expands on screen
4. Phases 3–6 repeat until all requirements are complete

## Data Model

- **User** — Metaforce account, managed by Supabase Auth. Can belong to many projects.
- **Project** — Top-level container. Groups users, an org, a conversation, and requirements. Has one org and one shared conversation.
- **ProjectUser** — Join table linking users to projects (many-to-many).
- **Org** — A connected Salesforce org. Stores instance URL and access token. Belongs to one project.
- **Conversation** — A single shared, endless chat thread per project. All collaborators read and write to it.
- **Message** — A single chat turn (user or agent). Belongs to a conversation. Persisted for agent history reconstruction and audit trail.
- **Requirement** — A unit of Salesforce work scoped to a project, described in natural language. Ordered and status-tracked. Generated from the conversation.
- **Action** — A granular step under a requirement. Maps to one SFDX Server tool call. Has its own status (pending / executing / complete / error).
- **MetadataComponent** — A record of a successfully created Salesforce metadata item. Stores name, type, org, and raw XML. Linked to the action that created it. Enables reuse across future requirements.

## Key Decisions
- Chrome extension handles org authentication — avoids OAuth complexity and AppExchange dependency
- SFDX Server is stateless — it executes and returns; all persistence is handled by the agent backend
- Vercel AI SDK manages agent streaming and tool calling
- One shared conversation per project — enforces a single source of truth for requirements across collaborators
- Supabase Realtime broadcasts action and requirement status to all project members
- Each action is individually approved and retried on error before proceeding

## Constraints
- SFDX Server must run as a separate Docker container
- No direct Supabase access from the SFDX Server
- One org per project
- POC restricted to custom objects and fields