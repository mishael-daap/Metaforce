# Tasks
- [ ] Create `getPendingRequirements` agent tool (queries Supabase for pending/planned requirements by projectId)
- [ ] Create `markRequirementCompleted` agent tool (updates requirement status to completed)
- [ ] Create mocked SFDX tools: `createCustomObject`, `createCustomField` (setTimeout + success response)
- [ ] Update agent system prompt / instructions to handle build mode flow (generate plan, get approval, execute, verify, mark complete, loop)
- [ ] Wire build mode in `/api/projectchat` route (ensure `mode` body is used to switch agent behavior)
- [ ] Test end-to-end: toggle Build Mode -> ask agent to build -> verify plan shown -> approve -> mocked tools run -> confirm -> requirement marked completed -> next requirement fetched
- [ ] Update `Docs/roadmap.md` - set Execution status to completed