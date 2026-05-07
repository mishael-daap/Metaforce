# Feature: Data Model

## Purpose
Define and provision all Supabase tables, relationships, and RLS policies to support the Metaforce platform's core functionality: project management, Salesforce org connections, requirement gathering, action planning/execution, and metadata reuse.

## User Flow
1. User creates a project with a name and optional description
2. User links a Salesforce org to the project (access token, domain URL, username)
3. A shared conversation is automatically created for the project
4. User adds requirements with title and description
5. AI expands requirements into actions with tool and parameters
6. Actions are executed, and successful XML is saved to metadata library for reuse
7. Failed actions receive suggested fixes for retry

## Rules
- One org per project (enforced via unique constraint on orgs.project_id)
- One shared conversation per project (enforced via unique constraint on conversations.project_id)
- One user can have multiple projects
- POC scope limited to custom objects and custom fields
- Authentication and RLS deferred to later implementation
- Metadata definitions stored as XML strings

## Edge Cases
- Project created without org (org can be added later)
- Requirement with no actions (valid state)
- Action with failed status and no suggested_fix (waiting for diagnosis)
- Metadata component with same api_name (enforced unique constraint)

## Acceptance Criteria
- [ ] All 8 tables created with correct schema
- [ ] Foreign key relationships established
- [ ] Unique constraints enforced (orgs.project_id, conversations.project_id, metadata_components.api_name)
- [ ] Default timestamps (created_at, updated_at) working
- [ ] Migration successfully pushed to Supabase
- [ ] TypeScript types generated from schema
