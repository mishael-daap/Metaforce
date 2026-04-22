# Project Documentation Guide

This guide defines the structure, skeleton, and quality criteria for the core documents in your AI-assisted software project.

---

## Documentation Folder Structure

```
/ai
  overview.md          # High-level project description and purpose
  architecture.md      # System architecture and design decisions
  roadmap.md           # Feature order, goals, and status tracking
  instructions.md      # AI instructions and workflow rules
  guides/
    doc-standards.md   # This guide
    feature-standards.md
  dependencies/        # Controlled dependency knowledge
    <dependency-name>/
      docs.md          # Official docs for that dependency
  features/            # Feature-specific documentation
    <feature-name>/
      spec.md
      tech.md
      tasks.md
```

**Rules:**
- All core project documents live at `/ai/` root
- `guides/` contains reference guides and templates
- `dependencies/` stores fetched docs for libraries/dependencies used
- `features/` stores feature-specific documentation


## 1. `overview.md`

### Purpose

Define *what the system is* and *why it exists*.

### Skeleton

```md
# Overview

## Product
Short description of the system.

## Target Users
Who this is for.

## Problem
What problem it solves.

## Core Features
- Feature 1 (1 line)
- Feature 2
- Feature 3

## Constraints (Optional)
- Tech constraints
- Business rules
```

### Quality Criteria

* Clear in under 30 seconds
* No technical noise
* No implementation details

Bad: Long explanations, mixing in architecture, deep feature flows.

---

## 2. `architecture.md`

### Purpose

Define *how the system is structured* to guide the AI.

### Skeleton

```md
# Architecture

## Stack
- Frontend:
- Backend:
- Database:

## System Structure
Describe main parts:
- API server
- Client
- Database

## Data Flow
Simple description:
User → Frontend → API → Database → Response

## Core Entities
- User
- Payment
- etc.

## Key Decisions
- Auth method (JWT, sessions, etc.)
- API style (REST, GraphQL)
- State management approach

## Constraints
- Must use X
- Avoid Y
```

### Quality Criteria

* High-level, not code-level
* Defines patterns clearly
* Leaves little room for interpretation

Bad: Too vague, too detailed, missing key decisions.

---

## 3. `roadmap.md`

### Purpose

Control **order + status + scope** of features.

### Skeleton

```md
# Roadmap

## 1. Auth
Status: pending
Goal: User signup and login

## 2. Payments
Status: pending
Goal: Handle transactions

## 3. Dashboard
Status: pending
Goal: Display user data
```

### Status Options

* pending
* in development
* completed

Quality: Simple, scannable, strict order, 1-sentence goals.

Bad: Adding specs, technical notes, brain dumps.

---

## Global Rules

1. **No duplication**: Each piece of info lives in ONE place.
2. **Keep everything minimal**: Remove anything that doesn’t help implementation.
3. **Clarity over completeness**: Clear and slightly incomplete > complete but confusing.
4. **Files have strict roles**:

   * overview → what
   * architecture → system how
   * roadmap → what’s next
   * spec → feature behavior
   * tech → implementation
   * tasks → execution