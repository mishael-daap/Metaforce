# Salesforce Development Agent - Execution Plan

## Agent Workflow

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ 1. REQUIREMENTS GATHERING (Fast Model)                                       │
│    User chats → Fast model asks questions → CRUD tools create/requirement   │
│    → Refine until user says "perfect" → Requirement marked as approved       │
└─────────────────────────────────────────────────────────────────────────────┘
                                      ↓
┌─────────────────────────────────────────────────────────────────────────────┐
│ 2. ACTION PLANNING (Reasoning Model)                                         │
│    Approved requirement + tool descriptions → Reasoning model analyzes      │
│    → Generates structured action plan with dependencies → User reviews       │
└─────────────────────────────────────────────────────────────────────────────┘
                                      ↓
┌─────────────────────────────────────────────────────────────────────────────┐
│ 3. ACTION EXECUTION                                                          │
│    User approves plan → Execute actions in order → Call tools via SFDx      │
│    → On success: update action to "completed" → On failure: diagnose error   │
│    → Suggest fix → Update action → User approves fix → Retry                │
└─────────────────────────────────────────────────────────────────────────────┘
                                      ↓
┌─────────────────────────────────────────────────────────────────────────────┐
│ 4. VERIFICATION                                                              │
│    All actions complete → User verifies in Salesforce org                    │
│    → User confirms → Requirement marked as "completed" → Next requirement    │
└─────────────────────────────────────────────────────────────────────────────┘
```

## Phase 1: Foundation

### 1.1 Define Data Models

**Requirement Schema**
```typescript
{
  id: string,                    // UUID
  title: string,                 // Short name (e.g., "Customer Portal")
  description: string,           // Full requirement details
  status: 'draft' | 'approved' | 'completed',
  created_at: timestamp,
  updated_at: timestamp,
  user_id: string,               // Who created this requirement
  conversation_id: string,        // Links to chat session
}
```

**Action Schema**
```typescript
{
  id: string,                    // UUID
  requirement_id: string,        // FK to requirements
  tool: string,                  // Tool name (e.g., "createCustomObject")
  parameters: jsonb,             // Tool-specific parameters
  description: string,           // Human-readable explanation
  status: 'pending' | 'approved' | 'completed' | 'failed',
  order: number,                // Execution order
  depends_on: string[],         // Array of action IDs this depends on
  error_message: string | null,  // Error from tool call
  suggested_fix: string | null,  // Reasoning model's fix suggestion
  created_at: timestamp,
  updated_at: timestamp,
}
```

### 1.2 Define Tool Interface

**Standard Tool Call Format**
```typescript
{
  tool: string,        // Tool name
  parameters: object,   // Tool-specific parameters
  description: string   // Human-readable explanation
}
```

**Tool Response Format**
```typescript
{
  success: boolean,
  data?: any,          // Response data on success
  error?: string       // Error message on failure
}
```

**Requirement CRUD Tools**
```typescript
createRequirement(title: string, description: string, conversation_id: string): Requirement

getRequirement(id: string): Requirement

updateRequirement(id: string, title?: string, description?: string, status?: 'draft' | 'approved' | 'completed'): Requirement

deleteRequirement(id: string): void
listRequirements(user_id?: string, conversation_id?: string, status?: string): Requirement[]
```

**Action CRUD Tools**
```typescript
createAction(requirement_id: string, tool: string, parameters: object, description: string, order: number, depends_on?: string[]): Action
getAction(id: string): Action
updateAction(id: string, status?: 'pending' | 'approved' | 'completed' | 'failed', error_message?: string, suggested_fix?: string): Action
deleteAction(id: string): void
listActions(requirement_id: string, status?: string): Action[]
createActions(requirement_id: string, actions: ActionCreateInput[]): Action[]  // Batch create
```

**Core Salesforce Tools**
- createCustomObject, createCustomField, deployMetadata, describeObject, runApex

## Phase 2: Fast Model (Requirements Chat)

### 2.1 System Prompt
- Persona: helpful Salesforce consultant
- Instructions: gather requirements, ask clarifying questions, refine until user approves
- Tool descriptions: CRUD operations for requirements

### 2.2 Chat Interface
- Streaming conversation using [[basic-chatbot]] pattern
- Real-time requirement creation/update via tool calls
- "Mark as perfect" command to finalize requirement

## Phase 3: Reasoning Model (Action Planning)

### 3.1 System Prompt
- Persona: Salesforce technical architect
- Instructions: analyze requirement, break into atomic actions, consider dependencies
- Tool descriptions: All available Salesforce tools with parameters and common errors

### 3.2 Structured Output Schema
```typescript
{
  actions: [{
    id: string,
    tool: string,
    parameters: object,
    description: string,
    order: number,
    dependsOn: string[]  // action IDs this depends on
  }]
}
```

### 3.3 Planning Logic
- Parse requirement into discrete steps
- Identify dependencies (e.g., create object before fields)
- Order actions topologically
- Generate clear descriptions for each action

## Phase 4: Execution Engine

### 4.1 Action Executor
- Iterate through approved actions in order
- Call tools via [[tool-use]] pattern
- Update action status after each call

### 4.2 Error Handling
- On failure: capture error, pass to reasoning model
- Reasoning model analyzes error and suggests fix
- Update action with error_message and suggested_fix
- Pause for user approval before retry

### 4.3 State Management
- Update Supabase after each action completes
- Track progress for UI display
- Handle concurrent action execution where safe

## Phase 5: User Interface

### 5.1 Requirements View
- List all requirements with status
- Chat interface for each requirement
- "Plan" button to trigger action generation

### 5.2 Actions View
- Show action plan for selected requirement
- Approve/reject individual actions
- Real-time execution progress
- Error display with suggested fixes

### 5.3 Verification Step
- "Verify in org" button after all actions complete
- Mark requirement as completed when user confirms

## Phase 6: Integration & Testing

### 6.1 Tool Integration
- Connect to SFDx server endpoints
- Test each tool independently
- Validate error handling

### 6.2 End-to-End Testing
- Simple requirement: create one custom object
- Complex requirement: object + fields + page layout
- Error scenario: duplicate field, invalid name

### 6.3 Refinement
- Tune prompts based on test results
- Adjust action granularity if needed
- Optimize error diagnosis accuracy
