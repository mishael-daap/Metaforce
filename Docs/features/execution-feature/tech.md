# Technical Plan: Execution (Action Execution for Build Mode)

## Components
- **Agent API Route** (`/api/projectchat` or dedicated route): Now supports `build` mode in addition to `plan` mode.
- **Agent Tools** (in agent definition):
  - `getPendingRequirements` - queries Supabase for requirements with status `pending` or `planned` for the current project.
  - `markRequirementCompleted` - updates a requirement's status to `completed`.
- **Mocked SFDX Tools**:
  - `createCustomObject` - accepts object name and fields; simulates work with `setTimeout`, returns success XML.
  - `createCustomField` - accepts object name, field name, and type; simulates work with `setTimeout`, returns success XML.
  - (Additional tools added as needed, e.g., `assignPermissionSet`, `createTab`)
- **Chat UI** (`project-chat.tsx`): Handles `mode === 'build'`; no new UI components needed for this stage since everything happens in the chat stream.

## API
- `POST /api/projectchat` - already exists; extended to handle `build` mode in the request body.
  - Request body: `{ messages, projectId, mode: 'plan' | 'build' }` (existing, mode already sent)

## Data Model
No new tables. Existing `requirements` table fields used:
- `id` (uuid, PK)
- `project_id` (uuid, FK -> projects)
- `title` (text)
- `description` (text)
- `status` (enum: `pending`, `planned`, `completed`, `cancelled`)

The requirement `status` is the sole state machine for execution.

## Flow
1. User sends a message with `mode: 'build'` in the request body.
2. Agent receives the message. If the intent is to build requirements, it calls `getPendingRequirements(projectId)`.
3. Agent selects the first pending requirement and drafts an action plan in natural language.
4. Agent sends the plan to the user and waits for approval.
5. On approval, agent calls mocked SFDX tools in sequence.
6. After all tools succeed, agent asks the user to verify in their org.
7. On user confirmation, agent calls `markRequirementCompleted(requirementId)`.
8. Agent calls `getPendingRequirements` again to loop.

## Notes
- Mocked tools are pure functions with `await new Promise(r => setTimeout(r, 1000))` to simulate async work.
- Tool return format should match the expected real SFDX response format (JSON/XML with success status and metadata info) so the transition to real tools is trivial.
- The agent is stateless; all execution state lives in the database (requirement status) and conversation history.
- When the real SFDX server is built (roadmap item 10), replace the mocked tool bodies with HTTP calls to the server.