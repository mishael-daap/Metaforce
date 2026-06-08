# Projects

Project listing, detail, and chat interface. Projects are owned by a single user (`created_by`). No multi-user membership. Middleware `proxy.ts` guards `/dashboard/:path*` and `/project/:path*`.

**Files:** `app/dashboard/projects/page.tsx`, `app/dashboard/project/[projectId]/page.tsx`, `app/project/[projectId]/page.tsx`, `app/project/[projectId]/actions.ts`, `components/chat/project-chat.tsx`, `components/chat/chat.tsx`, `components/chat/project-setup-modal.tsx`, `components/chat/fetch-latest-modal.tsx`, `components/chat/requirements-list.tsx`, `components/projects/project-card.tsx`, `components/projects/create-project-dialog.tsx`, `components/projects/edit-project-dialog.tsx`, `components/projects/delete-project-dialog.tsx`, `components/layout/sidebar-layout.tsx`, `app/api/projects/route.ts`, `app/api/projects/[id]/route.ts`, `app/api/projects/[id]/metadata/route.ts`, `app/api/orgs/[projectId]/route.ts`, `app/api/orgs/[projectId]/setup/route.ts`, `app/api/orgs/[projectId]/fetch/route.ts`, `hooks/use-project-name.ts`, `hooks/use-requirements.ts`, `lib/chat-store.ts`

## Project Listing

`app/dashboard/projects/page.tsx` is a client component that fetches projects via `GET /api/projects`, then renders a searchable/sortable grid of `ProjectCard` components. Sorting (newest/oldest/name) and search (by name) are client-side. Cards show project name, description, creation date, and an "Open Chat" button. Each card has a dropdown for Edit and Delete, which open `EditProjectDialog` and `DeleteProjectDialog` respectively. Creating a project opens `CreateProjectDialog`, a two-step form: step 1 collects name + description, step 2 collects org credentials (domain URL, username, access token). On submit, it calls `POST /api/projects`.

```typescript
const response = await fetch("/api/projects", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    name: name.trim(),
    description: description.trim(),
    org: { domain_url: domainUrl, username, access_token: accessToken },
  }),
});
```

## Project Detail

`app/dashboard/project/[projectId]/page.tsx` is a server component that fetches the project via `GET /api/projects/:id` and its metadata components via `GET /api/projects/:id/metadata` in parallel. It renders: project info card (name, description, created/updated dates, metadata component count), a metadata components grid (cards with type badge — "Custom Object" or "Custom Field"), and a danger zone with "Delete Project". Clicking "Go to Chat" navigates to `/project/[projectId]`.

## Chat Interface

`app/project/[projectId]/page.tsx` is a server component. It calls `getConversationForProject(projectId)` from `lib/chat-store.ts`, falls back to `createConversation(projectId)` if none exists, then loads all messages via `loadMessages`. It passes `initialMessages` and `projectId` to `ProjectChat`.

```typescript
const conversation =
  (await getConversationForProject(projectId)) ??
  (await createConversation(projectId));
const messages = await loadMessages(conversation.id);
return <ProjectChat projectId={projectId} initialMessages={messages} />;
```

`ProjectChat` (`components/chat/project-chat.tsx`) is a full-screen client component with a resizable panel layout: left = `Chat` component, right = `RequirementsList` (toggleable). It manages plan/build mode via `mode` state. The mode toggle button in the chat input switches between plan and build. Switching from plan → build is instant. Switching from build → plan is instant.

## ProjectSetupModal

`components/chat/project-setup-modal.tsx` is a modal dialog for connecting a Salesforce org. It has two sub-steps within a single modal:

1. **Input** — collects the Salesforce access token from the user. The org domain URL and username are read from the database via `GET /api/orgs/:projectId` (never sent to the client).
2. **Running** — calls `POST /api/orgs/:projectId/setup` with the access token. The server reads the org URL from the database and calls the SFDX server's `POST /metadata/project-setup` endpoint. Output is displayed in a terminal-style panel.
3. **Done** — shows success output. "Next: Fetch Latest" button closes the modal so the user can open the FetchLatestModal from the Actions dropdown.
4. **Error** — shows the error message with a retry button.

```typescript
const result = await setupProject(projectId, accessToken.trim(), orgUrl);
```

## FetchLatestModal

`components/chat/fetch-latest-modal.tsx` is a modal dialog for pulling metadata from a connected org. It shows the org URL and username (fetched from `GET /api/orgs/:projectId`) as read-only fields, then calls `POST /api/orgs/:projectId/fetch` which reads stored org credentials from the database and calls the SFDX server's `POST /metadata/fetch-latest` endpoint. Output is displayed in a terminal-style panel.

```typescript
const result = await fetchLatest(projectId, org.access_token, org.domain_url);
```

## Chat UI

`components/chat/chat.tsx` uses `useChat` from `@ai-sdk/react` with a `DefaultChatTransport` pointing to `/api/projectchat`. The request body includes `projectId` and `mode` ("plan" or "build"). Plan mode uses requirement tools only. Build mode uses requirement tools + SFDX tools.

```typescript
const { messages, sendMessage, status } = useChat({
  id: projectId,
  messages: initialMessages,
  transport: new DefaultChatTransport({
    api: "/api/projectchat",
    prepareSendMessagesRequest({ messages, id, body }) {
      return { body: { messages, projectId: id, ...body } };
    },
  }),
  onFinish: async ({ messages: finalMessages }) => {
    onFinish?.(finalMessages);
  },
});
```

The input area has:
- A textarea for composing messages
- A **Mode** toggle button (Plan/Build) — clicking it instantly switches mode. In plan mode it shows "plan". In build mode it shows "build" with a filled (primary) style.
- An **Actions** dropdown button next to the mode toggle — opens a menu with "Project Setup" and "Fetch Latest" items. Opens the respective modals.
- A submit button on the right.

```typescript
const toggleMode = () => {
  setMode((prev) => (prev === "plan" ? "build" : "plan"));
};
```

```tsx
<Button onClick={toggleMode} className={cn("h-7 px-3 rounded-full border", ...)}>
  <span className="text-xs capitalize">{mode}</span>
</Button>

<DropdownMenu>
  <DropdownMenuTrigger asChild>
    <Button variant="ghost" size="sm" className="h-7 px-2 rounded-full border ...">
      Actions
    </Button>
  </DropdownMenuTrigger>
  <DropdownMenuContent align="start">
    <DropdownMenuItem onSelect={() => setSetupModalOpen(true)}>Project Setup</DropdownMenuItem>
    <DropdownMenuItem onSelect={() => setFetchModalOpen(true)}>Fetch Latest</DropdownMenuItem>
  </DropdownMenuContent>
</DropdownMenu>
```

## ProjectChat API

`app/api/projectchat/route.ts` handles both modes. It loads conversation context, project details, and optimized message history (with summarization). Plan mode streams with requirement tools. Build mode streams with requirement + SFDX tools. Both save the assistant's response to the messages table on finish.

**Ownership check (added to prevent unauthorized access):** Before any data access, the route verifies the caller's session exists, then checks that `projects.created_by` matches `session.user.id`. Returns `401` if no session, `403` if not the owner, `404` if project doesn't exist. This mirrors the exact pattern used in all other project API routes.

## Server Actions

`app/project/[projectId]/actions.ts` provides three server actions for the requirements panel:

- `getProjectRequirements(projectId)` — fetches all requirements for a project, ordered by `created_at DESC`
- `updateRequirement(id, title, description, projectId)` — updates a requirement, then calls `revalidatePath`
- `deleteRequirement(id, projectId)` — deletes a requirement, then calls `revalidatePath`

## Requirements List

`components/chat/requirements-list.tsx` renders requirements as collapsible accordion items. Each item shows a chevron toggle, title, color-coded status badge (Pending/Planned/Completed/Cancelled), and Markdown-rendered description when expanded. Edit and delete buttons appear when expanded.

## APIs

### `GET /api/projects`

Lists all projects for the current user.

```typescript
const { data: projects } = await supabase
  .from("projects")
  .select("*")
  .eq("created_by", session.user.id)
  .order("created_at", { ascending: false });
```

### `POST /api/projects`

Creates a project + conversation + org in sequence.

```typescript
const { data: project } = await supabase
  .from("projects")
  .insert({ name, description, created_by: session.user.id })
  .select()
  .single();
await supabase.from("conversations").insert({ project_id: project.id });
await supabase.from("orgs").insert({
  project_id: project.id,
  domain_url,
  username,
  access_token,
});
```

### `GET /api/projects/:id`

Fetches a single project. Checks ownership via `created_by`.

### `PUT /api/projects/:id`

Updates name and description. Checks ownership.

### `DELETE /api/projects/:id`

Deletes a project. Database cascade cleans up related records.

### `GET /api/projects/:id/metadata`

Fetches metadata components for a project, ordered by `created_at DESC`. Checks ownership.

### `GET /api/orgs/:projectId`

Returns `{ domain_url, username }` for a project's connected org. **Never returns `access_token`.** Checks project ownership via `created_by`.

### `POST /api/orgs/:projectId/setup`

Accepts `{ accessToken }` in the request body. Reads the org's `domain_url` from the database server-side (never exposed to client). Calls `setupProject(projectId, accessToken, orgUrl)` which hits the SFDX server's `POST /metadata/project-setup`. Checks project ownership via `created_by`.

### `POST /api/orgs/:projectId/fetch`

Reads the org's `domain_url` and `access_token` from the database server-side. Calls `fetchLatest(projectId, accessToken, orgUrl)` which hits the SFDX server's `POST /metadata/fetch-latest`. Checks project ownership via `created_by`.

## Sequence Diagram

```mermaid
sequenceDiagram
  participant U as User
  participant M as Middleware (proxy.ts)
  participant SL as SidebarLayout
  participant PL as ProjectsPage
  participant API as /api/projects
  participant DB as Supabase
  participant D as CreateProjectDialog
  participant PD as ProjectDetailPage
  participant PC as ProjectChatPage
  participant CC as Chat component
  participant SM as ProjectSetupModal
  participant FM as FetchLatestModal
  participant PCC as /api/projectchat
  participant OrgAPI as /api/orgs/:projectId
  participant OrgSetupAPI as /api/orgs/:projectId/setup
  participant OrgFetchAPI as /api/orgs/:projectId/fetch
  participant SFDX as lib/sfdx/project

  %% Middleware guards
  U->>M: Navigate to /dashboard/projects or /project/:id
  M->>M: auth() check
  alt No session
    M-->>U: Redirect to /register
  else Session exists
    M-->>SL: Allow through
  end

  %% Sidebar renders
  SL->>SL: Render sidebar (Projects link)
  SL->>PL: Render children

  %% List projects
  PL->>API: GET /api/projects
  API->>DB: select * from projects where created_by = user.id
  DB-->>API: projects[]
  API-->>PL: projects[]
  PL->>PL: Filter + sort client-side
  PL->>U: Render ProjectCard grid

  %% Create project
  U->>D: Click "Create Project"
  D->>D: Step 1: name + description
  U->>D: Click "Next"
  D->>D: Step 2: org credentials (URL, username, access token)
  U->>D: Click "Create Project"
  D->>API: POST /api/projects { name, description, org }
  API->>DB: insert projects
  DB-->>API: project
  API->>DB: insert conversations
  API->>DB: insert orgs
  API-->>D: 201 project
  D->>PL: onProjectCreated → refetch
  PL->>U: New card in grid

  %% View project detail
  U->>PD: Click card → /dashboard/project/:id
  PD->>API: GET /api/projects/:id
  PD->>API: GET /api/projects/:id/metadata
  API->>DB: select metadata_components where project_id = :id
  DB-->>API: components[]
  API-->>PD: project + components
  PD->>U: Render info + metadata grid

  %% Navigate to chat
  U->>PC: Click "Go to Chat" → /project/:id
  PC->>DB: getConversationForProject(projectId)
  alt No conversation
    PC->>DB: createConversation(projectId)
  end
  PC->>DB: loadMessages(conversationId)
  DB-->>PC: messages[]
  PC->>CC: Render with initialMessages

  %% Plan mode chat
  CC->>PCC: POST /api/projectchat { messages, projectId, mode: "plan" }
  PCC->>DB: getConversationForProject + ownership check
  PCC->>DB: getOptimizedContext (summary + recent messages)
  PCC->>PCC: handlePlanMode → streamText with requirement tools
  PCC->>DB: saveMessages (onFinish)
  PCC-->>CC: UI message stream

  %% Project Setup via modal
  U->>CC: Click "Actions" → "Project Setup"
  CC->>SM: Open ProjectSetupModal
  SM->>OrgAPI: GET /api/orgs/:projectId → { domain_url, username }
  SM->>U: Show org URL + username (read-only) + access token input
  U->>SM: Enter access token, click "Setup Project"
  SM->>OrgSetupAPI: POST /api/orgs/:projectId/setup { accessToken }
  OrgSetupAPI->>DB: select domain_url from orgs (server-side)
  OrgSetupAPI->>SFDX: setupProject(projectId, accessToken, orgUrl)
  SFDX-->>OrgSetupAPI: result
  OrgSetupAPI-->>SM: { success: true, data }
  SM->>U: Show setup output, "Next: Fetch Latest" button

  %% Fetch Latest via modal
  U->>CC: Click "Actions" → "Fetch Latest"
  CC->>FM: Open FetchLatestModal
  FM->>OrgAPI: GET /api/orgs/:projectId → { domain_url, username }
  FM->>U: Show org info (read-only)
  U->>FM: Click "Fetch Latest Metadata"
  FM->>OrgFetchAPI: POST /api/orgs/:projectId/fetch
  OrgFetchAPI->>DB: select domain_url, access_token from orgs (server-side)
  OrgFetchAPI->>SFDX: fetchLatest(projectId, accessToken, orgUrl)
  SFDX-->>OrgFetchAPI: result
  OrgFetchAPI-->>FM: { success: true, data }
  FM->>U: Show fetch output, "Close" button

  %% Build mode chat
  U->>CC: Click "Plan" toggle → setMode("build")
  CC->>PCC: POST /api/projectchat { messages, projectId, mode: "build" }
  PCC->>DB: ownership check
  PCC->>DB: getOptimizedContext
  PCC->>PCC: handleBuildMode → streamText with requirement + SFDX tools
  PCC->>DB: saveMessages (onFinish)
  PCC-->>CC: UI message stream

  %% Delete project
  U->>PD: Click "Delete Project"
  PD->>U: Confirm dialog
  U->>PD: Confirm
  PD->>API: DELETE /api/projects/:id
  API->>DB: delete from projects where id = :id
  API-->>PD: { success: true }
  PD->>U: Redirect to /dashboard/projects
```

```mermaid
sequenceDiagram
  participant U as User
  participant PD as ProjectDetailPage
  participant API as API routes
  participant DB as Supabase

  %% Edit project
  U->>PD: Click "Edit"
  PD->>U: Open EditProjectDialog
  U->>PD: Change name/description, submit
  PD->>API: PUT /api/projects/:id { name, description }
  API->>DB: select project (ownership check)
  API->>DB: update projects set name, description
  API-->>PD: updated project
  PD->>U: Dialog closes, data refreshed

  %% View metadata components
  PD->>API: GET /api/projects/:id/metadata
  API->>DB: select * from metadata_components where project_id = :id
  DB-->>API: components[]
  API-->>PD: components[]
  PD->>PD: Render MetadataComponent cards with type badges

  %% Metadata component display loop
  PD->>PD: For each component: render card with name, api_name, type badge, created date
```
