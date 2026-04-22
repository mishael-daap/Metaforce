## Feature Docs (`/features/<feature>/`)

### A. `spec.md`

### Purpose

Define **what the feature does**.

### Skeleton

```md
# Feature: <Name>

## Purpose
What this feature achieves

## User Flow
Step-by-step interaction

## Rules
- Validation rules
- Constraints
- Edge cases

## Acceptance Criteria
- [ ] Condition 1
- [ ] Condition 2
- [ ] Condition 3
```

### Quality Criteria

* Clear flows
* Covers edge cases
* Testable criteria

Bad: vague descriptions, missing rules, no acceptance criteria.

---

### B. `tech.md`

### Purpose

Define **how the feature will be built**.

### Skeleton

```md
# Technical Plan

## Components
- Service names
- Modules

## API
- Endpoint: POST /login
- Endpoint: POST /signup

## Data Model
User {
  id
  email
  passwordHash
}

## Flow
Short technical flow:
Request → Validation → Service → DB → Response

## Notes
- Use JWT
- Hash passwords
```

### Quality Criteria

* Concrete (endpoints, models)
* Matches architecture
* No fluff

Bad: too abstract, missing pieces, contradicts architecture.

---

### C. `tasks.md`

### Purpose

Drive execution.

### Skeleton

```md
# Tasks

- [ ] Create User model
- [ ] Implement signup endpoint
- [ ] Add validation
- [ ] Implement login
- [ ] Write tests
```

### Quality Criteria

* Small, actionable tasks
* Logical order
* Each task testable

Bad: tasks too big, vague, or missing steps.
