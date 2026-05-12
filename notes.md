Problem

  The data model currently uses a public.users table, but NextAuth manages users in the next_auth.users table. This
  causes API queries to fail and creates unnecessary duplication.

  Changes Required

  1. API Code Changes

  Update all API endpoints to query the next_auth schema:

  Files to update:
  - web/app/api/projects/route.ts
  - web/app/api/projects/[id]/route.ts

  Change pattern:
  // Before
  const { data: user, error: userError } = await supabase
    .from("users")
    .select("id")
    .eq("email", userEmail)
    .single();

  // After
  const { data: user, error: userError } = await supabase
    .schema("next_auth")
    .from("users")
    .select("id")
    .eq("email", userEmail)
    .single();

  2. Database Migration Changes

  Drop:
  - public.users table
  - update_users_updated_at trigger (references users table)
  - idx_projects_created_by index (references users table - will be recreated with new reference)
  - idx_metadata_components_created_by index (references users table - will be recreated with new reference)

  Update foreign key references:
  - projects.created_by → REFERENCES next_auth.users(id) (currently REFERENCES users(id))
  - metadata_components.created_by → REFERENCES next_auth.users(id) (currently REFERENCES users(id))

  Recreate indexes with new references:
  - idx_projects_created_by ON projects(created_by)
  - idx_metadata_components_created_by ON metadata_components(created_by)

  ---
  Impact

  - No data loss — NextAuth users table is the source of truth
  - Cleaner architecture — Single source of truth for user data
  - Simpler queries — No need to sync between two user tables