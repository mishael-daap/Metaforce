# Technical Plan: Planning & Sequencing Logic

## Architecture

```
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│   Chat UI       │────▶│  /api/chat       │────▶│  LLM (Plan Mode)│
│   (Mode Toggle) │     │  (mode switch)   │     │  Structured Out │
└─────────────────┘     └──────────────────┘     └─────────────────┘
         ▲                       │
         │                       ▼
         │              ┌──────────────────┐
         └──────────────│  PlanComponent   │
                        │  (render + approve)
                        └──────────────────┘
```

## File Structure

```
web/
├── app/
│   └── api/
│       └── chat/
│           └── route.ts          # Unified handler with mode switch
├── components/
│   └── plan/
│       ├── PlanComponent.tsx     # Main plan renderer
│       ├── PlanRequirement.tsx   # Individual requirement item
│       └── PlanAction.tsx        # Individual action item
├── lib/
│   ├── ai/
│   │   └── planner.ts            # LLM planning logic
│   └── schemas/
│       └── plan-schemas.ts       # Zod schemas for plans
└── hooks/
    └── use-plan-mode.ts          # Plan mode state management
```

## Component Details

### 1. Unified Chat API Handler (`/api/chat/route.ts`)

```typescript
export async function POST(req: Request) {
  const { messages, mode } = await req.json();

  switch (mode) {
    case 'plan':
      return handlePlan(messages);
    case 'execute':
      return handleExecute(messages); // Feature 8
    default:
      return handleChat(messages);
  }
}
```

### 2. Zod Schemas (`lib/schemas/plan-schemas.ts`)

```typescript
const ActionSchema = z.object({
  id: z.string(),
  tool: z.enum(['createObject', 'createField', 'deploy']),
  label: z.string(),
  params: z.record(z.unknown()),
  dependsOn: z.array(z.string()).default([]),
});

const RequirementSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  actions: z.array(ActionSchema),
});

const ExecutionPlanSchema = z.object({
  requirements_summary: z.string(),
  requirements: z.array(RequirementSchema),
});
```

### 3. Planner System Prompt (`lib/ai/planner.ts`)

```typescript
export const PLANNER_SYSTEM_PROMPT = `
You are a Salesforce metadata planning expert.
Analyze user requirements and create a structured execution plan.

Rules:
1. Objects must be created before fields that reference them
2. Parent objects must exist before child Lookup/MasterDetail fields
3. Deployment happens after all objects and fields are created
4. Only support custom objects and custom fields
5. All API names must end with __c
`;
```

### 4. Plan Component (`components/plan/PlanComponent.tsx`)

```tsx
interface PlanComponentProps {
  plan: ExecutionPlan;
  onApprove: () => void;
  isApproved: boolean;
}

export function PlanComponent({ plan, onApprove, isApproved }: Props) {
  return (
    <div className="plan-container">
      <h3>{plan.requirements_summary}</h3>
      {plan.requirements.map(req => (
        <PlanRequirement key={req.id} requirement={req} />
      ))}
      <button onClick={onApprove} disabled={isApproved}>
        {isApproved ? 'Plan Approved' : 'Approve Plan'}
      </button>
    </div>
  );
}
```

### 5. Mode Toggle Hook (`hooks/use-plan-mode.ts`)

```tsx
export function usePlanMode() {
  const [mode, setMode] = useState<'plan' | 'execute'>('plan');
  
  const toggleMode = () => {
    setMode(prev => prev === 'plan' ? 'execute' : 'plan');
  };

  return { mode, toggleMode };
}
```

## Data Flow

1. **User Input** → Chat component captures message
2. **Mode Check** → `usePlanMode` returns current mode
3. **API Call** → POST `/api/chat` with `{ messages, mode: 'plan' }`
4. **LLM Processing** → Generates structured plan JSON
5. **UI Render** → PlanComponent displays requirements + actions
6. **User Approval** → Click "Approve Plan" → sends to API
7. **Acknowledge** → Agent confirms receipt (no execution yet)

## Integration Points

| Component | Integration |
|-----------|-------------|
| Chat UI | Mode toggle button, mode state |
| `/api/chat` | Mode switch in handler |
| PlanComponent | Render inside chat messages |
| MCP Tools | Plan actions map to tool definitions |

## Testing Strategy

1. **Unit Tests**: Zod schema validation, dependency sorting
2. **Component Tests**: PlanComponent renders correctly, approve button works
3. **Integration Tests**: Mode switch triggers correct handler branch
4. **E2E Tests**: Full flow from input to approved plan
