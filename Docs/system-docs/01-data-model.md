# Data Model

Supabase Postgres, evolved through 7 migrations. Note: the TypeScript type definitions in `src/types/database.ts` are out of sync with the actual schema — use this as source of truth.

## Tables

**projects** — Top-level container. Groups users, an org, a conversation, and requirements.

**orgs** — Salesforce org credentials. One per project.

**conversations** — One shared chat thread per project. Supports AI summarization.

**messages** — Chat turns. Stores the full UIMessage as JSONB.

**requirements** — Salesforce work items captured during Plan mode.

**metadata_components** — Records of deployed Salesforce metadata (objects and fields).

Users are managed by NextAuth in the `next_auth` schema, not in `public`.

## ERD

```mermaid
erDiagram
    next_auth.users ||--o{ projects : "creates"
    projects ||--|| orgs : "has one"
    projects ||--|| conversations : "has one"
    projects ||--o{ requirements : "contains"
    projects ||--o{ metadata_components : "contains"
    conversations ||--o{ messages : "has many"
    requirements ||--o{ metadata_components : "produces"
    metadata_components }o--|| orgs : "deployed to"
    metadata_components }o--o{ next_auth.users : "created by"
    next_auth.users ||--o{ projects : "member of"

    next_auth.users {
        uuid id PK
    }

    projects {
        uuid id PK
        text name "NOT NULL"
        text description "nullable"
        uuid created_by FK "→ next_auth.users"
        timestamptz created_at
        timestamptz updated_at
    }

    orgs {
        uuid id PK
        uuid project_id FK "UNIQUE → projects"
        text access_token "NOT NULL"
        text domain_url "NOT NULL"
        text username "NOT NULL"
        timestamptz created_at
        timestamptz updated_at
    }

    conversations {
        uuid id PK
        uuid project_id FK "UNIQUE → projects"
        text summary "nullable"
        int last_summarized_index "DEFAULT 0"
        timestamptz created_at
        timestamptz updated_at
    }

    messages {
        text id PK
        uuid conversation_id FK "→ conversations"
        jsonb ui_message "NOT NULL"
        timestamptz created_at
    }

    requirements {
        uuid id PK
        uuid project_id FK "→ projects"
        text title "NOT NULL"
        text description "NOT NULL"
        text status "CHECK: pending|planned|completed|cancelled, DEFAULT pending"
        timestamptz created_at
        timestamptz updated_at
    }

    metadata_components {
        uuid id PK
        text type "CHECK: custom_object|custom_field"
        text name "NOT NULL"
        text api_name "UNIQUE NOT NULL"
        text definition "NOT NULL"
        uuid created_by FK "→ next_auth.users, nullable"
        uuid project_id FK "→ projects, nullable"
        uuid requirement_id FK "→ requirements, nullable"
        uuid org_id FK "→ orgs, nullable"
        timestamptz created_at
        timestamptz updated_at
    }
```

## Migrations

| # | File | What changed |
|---|------|-------------|
| 1 | `20240507000000` | Created `users`, `projects`, `orgs`, `conversations`, `messages` (with `role`+`content`), `requirements`, `actions`, `metadata_components`. Indexes, triggers for `updated_at`. |
| 2 | `20240511000001` | Added `project_id` to `metadata_components`. |
| 3 | `20240512000000` | Dropped `users` table. Re-pointed `projects.created_by` and `metadata_components.created_by` to `next_auth.users`. |
| 4 | `20250516000000` | Dropped `actions` table entirely. Added `requirement_id` + `org_id` to `metadata_components`. |
| 5 | `20260513104503` | Dropped `role` and `content` from `messages`. Added `ui_message JSONB NOT NULL`. |
| 6 | `20260513121551` | Changed `messages.id` from UUID to TEXT. |
| 7 | `20260521095120` | Added `summary` and `last_summarized_index` to `conversations`. |
