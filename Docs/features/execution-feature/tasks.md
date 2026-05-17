# Tasks
- [x] Create `getPendingRequirements` agent tool (queries Supabase for pending/planned requirements by projectId) - Already exists in `requirements.ts`
- [x] `updateRequirement` tool (used to mark as completed) - Already exists in `requirements.ts`
- [x] Create mocked SFDX tools: `createCustomObject`, `createCustomField` (setTimeout + success response) - Added setTimeout delays
- [x] Update agent system prompt / instructions to handle build mode flow - Updated in `build.ts`
- [x] Wire build mode in `/api/projectchat` route - Wired in `route.ts`
- [ ] Test end-to-end: toggle Build Mode -> ask agent to build -> verify plan shown -> approve -> mocked tools run -> confirm -> requirement marked completed -> next requirement fetched
- [ ] Update `Docs/roadmap.md` - set Execution status to completed