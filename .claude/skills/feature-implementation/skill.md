---
name: feature-implementation
description: >
  Manages the complete feature lifecycle: design, spec generation, approval, file creation,
  task-by-task execution, and feature completion. Use this skill whenever the user wants to
  build, plan, spec, implement, or complete a feature — including phrases like "let's build X",
  "I want to add X", "plan out X", "implement the next task", "mark this feature done", or
  "what's next on the feature". Trigger for any stage of feature work, not just spec writing.
  Always consult this skill before doing anything related to a feature.
---

# Feature Skill

Covers the full lifecycle of a feature from first discussion to completion and roadmap update.

Read `references/templates.md` for the exact document skeletons and quality criteria for
`spec.md`, `tech.md`, and `tasks.md`.
---

## Lifecycle Stages

### Stage 1 — Design Phase (chat only, no files)

Discuss the feature with the user before writing anything:

- **Purpose** — What problem does this solve? Who is it for?
- **User Flow** — How does a user interact with it step by step?
- **Edge Cases** — What can go wrong? What are the constraints?
- **Implementation Approach** — Known tech decisions, services, or patterns to use?

Do NOT create any files during this phase. Stay in chat until the picture is clear.

---

### Stage 2 — Spec Generation (chat only, no files)

When the user asks for the spec, generate all three documents **in chat first** for review.

Follow the skeletons and quality criteria in `references/templates.md` exactly.

Rules:
- Do not introduce ideas not discussed in Stage 1
- Consolidate all prior decisions — nothing should surprise the user
- Structure MUST be: Feature Spec → Technical Plan → Task Breakdown

Present all three documents clearly labeled in chat before any files are created.

---

### Stage 3 — Approval Gate

Wait for explicit user approval before creating or modifying any files.
Never skip this step. Never assume approval.

---

### Stage 4 — File Creation

After approval

Update roadmap status:

Create the files at:

```
Docs/features/<feature-name>/
  spec.md
  tech.md
  tasks.md
```

- Use kebab-case for the feature folder name (e.g. `user-authentication`, `payment-flow`)
- Follow existing patterns from other feature folders if they exist
- Keep formatting consistent
- Do not add extra files

---

### Stage 5 — Task Execution

Work exclusively from `tasks.md`. Execute ONE task at a time.

After completing each task:
- Mark it as complete in `tasks.md`.
  Example: 
    - [ ] Create profile card
    After completion
    - [x] Create profile card
- Ensure it is functional and working before moving on

Do NOT:
- Skip tasks
- Combine multiple tasks into one step
- Jump ahead in the list

If a task is blocked or unclear, surface it to the user before continuing.

---

### Stage 6 — Feature Completion

A feature is complete only when:
- All tasks in `tasks.md` are marked done
- Tests pass
- User has validated the functionality

Once complete:
1. Update `Docs/roadmap.md` — set the feature status to "completed"
2. Commit code to git following the Git Rules in the project's `CLAUDE.md`

---

## Notes

- Never skip the approval gate between Stage 3 and Stage 4, regardless of context.
- If resuming mid-feature, check `tasks.md` to find the next incomplete task and continue
  from there — do not restart from Stage 1.