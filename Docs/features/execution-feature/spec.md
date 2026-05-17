# Feature: Execution (Action Execution for Build Mode)

## Purpose
Enable the AI agent to safely execute Salesforce operations by managing requirement execution through user-approved, step-by-step action plans. All SFDX tools are initially mocked (simulated with timeouts) since the real SFDX server does not exist yet.

## User Flow
1. User toggles to Build Mode in the project chat.
2. User tells the agent to build (e.g., "build these requirements").
3. Agent fetches all pending requirements via `getPendingRequirements` tool.
4. Agent selects the first pending requirement and generates an action plan.
5. Agent presents the action plan to the user via chat (e.g., "I will: 1) Create a Custom Object `Invoice__c`, 2) Add fields `Amount__c`, `DueDate__c`, `Status__c`").
6. User reviews the plan and approves (e.g., "proceed", "yes", "go ahead").
7. Agent executes mocked SFDX tools sequentially (e.g., `createObject`, `createField`), each with a simulated async delay.
8. After all mocked tools return success, agent informs the user and asks them to verify in their Salesforce org.
9. User confirms the requirement was built correctly.
10. Agent marks the requirement as `completed` via `markRequirementCompleted` tool.
11. Agent automatically fetches pending requirements again (step 3) and repeats until none remain.

## Rules
- Only `pending` or `planned` requirements can be executed.
- The agent must get explicit user approval before executing any mocked tools.
- Mocked tools simulate async behavior (setTimeout) and always return success for this POC.
- A requirement moves through states: `pending` -> `in_progress` (implicitly, via agent conversation) -> `completed`.
- If the user rejects the plan, the agent asks for clarification or skips to the next requirement.
- If user navigates away mid-execution, the agent resumes from the last incomplete requirement on return.

## Edge Cases
- No pending requirements: Agent informs the user and ends the session.
- User rejects action plan: Agent asks what to change or moves to the next requirement.
- All requirements completed: Agent congratulates the user and offers to switch back to Plan Mode.
- Multiple users in same project: Execution is driven by the conversation; only the active user can trigger builds.

## Acceptance Criteria
- [ ] Agent can call `getPendingRequirements` and receive a list of pending requirements.
- [ ] Agent generates and presents an action plan before executing any tools.
- [ ] Agent waits for explicit user approval before proceeding.
- [ ] Mocked SFDX tools execute with simulated delays and return success.
- [ ] After execution, agent prompts the user for verification.
- [ ] On user confirmation, agent calls `markRequirementCompleted` and requirement status updates to `completed`.
- [ ] Agent automatically loops to the next pending requirement until all are done.
- [ ] No real Salesforce org is contacted (all tools are mocked).