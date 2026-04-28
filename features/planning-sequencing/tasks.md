# Tasks: Planning & Sequencing Logic

## Task List

- [ ] 1. Create Zod schemas for plan structures
- [ ] 2. Create planner system prompt and LLM integration
- [ ] 3. Update `/api/chat/route.ts` with mode switch
- [ ] 4. Create PlanComponent with requirement/action rendering
- [ ] 5. Add mode toggle to chat UI
- [ ] 6. Integrate PlanComponent into chat messages
- [ ] 7. Implement approve plan flow

---

## Task Details

### Task 1: Create Zod schemas for plan structures
**File:** `web/lib/schemas/plan-schemas.ts`

Create Zod schemas for:
- `ActionSchema` - individual action with id, tool, label, params, dependsOn
- `RequirementSchema` - requirement with id, name, description, actions
- `ExecutionPlanSchema` - full plan with summary and requirements

**Done when:** Schemas exported and validated with test data

---

### Task 2: Create planner system prompt and LLM integration
**File:** `web/lib/ai/planner.ts`

Create:
- `PLANNER_SYSTEM_PROMPT` - guides LLM to generate structured plans
- `handlePlan()` function - calls LLM with structured output

**Done when:** Can generate valid plan from sample requirements

---

### Task 3: Update `/api/chat/route.ts` with mode switch
**File:** `web/app/api/chat/route.ts`

Modify handler to:
- Accept `{ messages, mode }` in request body
- Switch on mode: `'plan'` | `'execute'` | `'chat'`
- Route to appropriate handler function

**Done when:** API correctly routes based on mode parameter

---

### Task 4: Create PlanComponent with requirement/action rendering
**Files:** 
- `web/components/plan/PlanComponent.tsx`
- `web/components/plan/PlanRequirement.tsx`
- `web/components/plan/PlanAction.tsx`

Create components that:
- Display requirements as expandable sections
- Show actions with checkboxes (read-only) and labels
- Include "Approve Plan" button

**Done when:** Component renders mock plan correctly

---

### Task 5: Add mode toggle to chat UI
**File:** `web/components/chat/ChatInput.tsx` (or equivalent)

Add:
- Toggle button to switch between Plan/Execute modes
- Visual indicator of current mode
- `usePlanMode` hook for state management

**Done when:** User can toggle mode, state persists across interactions

---

### Task 6: Integrate PlanComponent into chat messages
**File:** `web/components/chat/ChatMessages.tsx` (or equivalent)

Modify to:
- Detect plan responses in message stream
- Render PlanComponent instead of plain text for plans
- Pass approve callback to component

**Done when:** Plans render as interactive components in chat

---

### Task 7: Implement approve plan flow
**Files:** `web/components/plan/PlanComponent.tsx`, `web/app/api/chat/route.ts`

Implement:
- Approve button sends approval message to API
- API acknowledges with confirmation
- Plan state updates to show "Approved" status

**Done when:** User can approve plan, receives confirmation from agent

---

## Definition of Done

All tasks complete + Acceptance Criteria from spec.md met:
- [ ] Plan Mode toggle exists and switches visual state
- [ ] User can enter requirements and receive a structured plan
- [ ] Plan component renders with correct hierarchy
- [ ] Actions are correctly sequenced (dependencies respected)
- [ ] Approve button sends approval signal to agent
- [ ] All Zod schemas validate correctly
- [ ] Error handling for invalid plan generation
