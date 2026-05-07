# Technical Plan

## Components
- Supabase (PostgreSQL database)
- Supabase CLI (migrations, type generation)

## API
No API endpoints — this is a database schema feature.

## Data Model

### users
```typescript
{
  id: uuid
  email: string (unique)
  username: string (unique)
  created_at: timestamptz
  updated_at: timestamptz
}
```

### projects
```typescript
{
  id: uuid
  name: string
  description: string | null
  created_by: uuid (FK → users.id)
  created_at: timestamptz
  updated_at: timestamptz
}
```

### orgs
```typescript
{
  id: uuid
  project_id: uuid (FK → projects.id, unique)
  access_token: string
  domain_url: string
  username: string
  created_at: timestamptz
  updated_at: timestamptz
}
```

### conversations
```typescript
{
  id: uuid
  project_id: uuid (FK → projects.id, unique)
  created_at: timestamptz
  updated_at: timestamptz
}
```

### messages
```typescript
{
  id: uuid
  conversation_id: uuid (FK → conversations.id)
  role: 'user' | 'assistant'
  content: string
  created_at: timestamptz
}
```

### requirements
```typescript
{
  id: uuid
  project_id: uuid (FK → projects.id)
  title: string
  description: string
  status: 'pending' | 'planned' | 'completed' | 'cancelled'
  created_at: timestamptz
  updated_at: timestamptz
}
```

### actions
```typescript
{
  id: uuid
  requirement_id: uuid (FK → requirements.id)
  description: string
  tool: 'sfdx_create_object' | 'sfdx_create_field' | 'sfdx_delete' | 'sfdx_update'
  parameters: jsonb
  status: 'pending' | 'approved' | 'in_progress' | 'completed' | 'failed'
  error_message: string | null
  suggested_fix: jsonb | null
  created_at: timestamptz
  updated_at: timestamptz
}
```

### metadata_components
```typescript
{
  id: uuid
  type: 'custom_object' | 'custom_field'
  name: string
  api_name: string (unique)
  definition: string (XML)
  created_by: uuid (FK → users.id)
  created_at: timestamptz
  updated_at: timestamptz
}
```

## Flow
1. Initialize Supabase CLI in project
2. Link to cloud project
3. Create migration with all tables
4. Push migration to cloud
5. Generate TypeScript types

## Notes
- Use `gen_random_uuid()` for default UUID values
- Use `now()` for default timestamps
- No RLS policies in this iteration
- No auth integration in this iteration
