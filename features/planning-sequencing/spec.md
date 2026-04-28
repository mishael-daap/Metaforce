# Feature Specification: Planning & Sequencing Logic

## Overview
Implement the agent's ability to ingest natural language requirements, sequence them into ordered actions, and map them to specific MCP tools (createObject, createField, deploy).

## User Flow

1. User toggles chat into **Plan Mode**
2. User enters requirements (e.g., "I need a Recruiting app with Candidates and Positions")
3. Agent analyzes and generates structured JSON execution plan
4. UI renders plan as a custom component with:
   - Requirements list with expandable actions
   - Checkbox for each action (read-only, shows completion status)
   - "Approve Plan" button
5. User reviews and clicks "Approve Plan"
6. Approval is sent back to agent (execution is Feature 8)

## Functional Requirements

### FR1: Plan Mode Toggle
- Chat interface must have a toggle button to switch between "Plan Mode" and "Execution Mode"
- Default mode: Plan Mode
- Visual indicator showing current mode

### FR2: Unified Chat API Handler
- POST `/api/chat` endpoint accepts `{ messages, mode }`
- Mode switch: `'plan'` | `'execute'` | `'chat'`
- Plan mode triggers structured plan generation
- Execution mode triggers tool execution (Feature 8)
- Chat mode for normal conversation

### FR3: Action Schema
Each action must include:
- `id`: Unique identifier (e.g., "action_1")
- `tool`: One of ['createObject', 'createField', 'deploy']
- `label`: Human-readable description
- `params`: Tool parameters
- `dependsOn`: Array of action IDs that must complete first

### FR4: Plan Visualization Component
- Render requirements as expandable list
- Each requirement shows its actions
- Each action has:
  - Checkbox (read-only)
  - Label
  - Status indicator
- "Approve Plan" button at bottom

### FR5: Plan Approval
- Clicking "Approve Plan" sends approval to agent
- Agent receives system prompt to acknowledge approval
- Execution does NOT start (reserved for Feature 8)

## Non-Functional Requirements

### NFR1: Response Time
- Plan generation should complete within 10 seconds

### NFR2: Schema Validation
- All plans must conform to ExecutionPlanSchema
- Invalid plans should trigger regeneration

### NFR3: Dependency Ordering
- Actions must be topologically sorted
- Parent objects created before child references
- Objects created before fields

## Constraints
- Restricted to custom objects and custom fields only
- Must use MCP tool definitions
- Checkboxes are read-only (user cannot manually toggle)

## Acceptance Criteria

1. [ ] Plan Mode toggle exists and switches visual state
2. [ ] User can enter requirements and receive a structured plan
3. [ ] Plan component renders with correct hierarchy (requirements → actions)
4. [ ] Actions are correctly sequenced (dependencies respected)
5. [ ] Approve button sends approval signal to agent
6. [ ] All Zod schemas validate correctly
7. [ ] Error handling for invalid plan generation
