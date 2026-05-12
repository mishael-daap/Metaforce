-- Migration: Migrate to NextAuth users schema
-- This migration removes the public.users table and updates all references to use next_auth.users

-- Step 1: Drop indexes that reference users
DROP INDEX IF EXISTS idx_projects_created_by;
DROP INDEX IF EXISTS idx_metadata_components_created_by;

-- Step 2: Drop foreign key constraints
ALTER TABLE projects DROP CONSTRAINT IF EXISTS projects_created_by_fkey;
ALTER TABLE metadata_components DROP CONSTRAINT IF EXISTS metadata_components_created_by_fkey;

-- Step 3: Drop the trigger on users table
DROP TRIGGER IF EXISTS update_users_updated_at ON users;

-- Step 4: Drop the public.users table
DROP TABLE IF EXISTS users;

-- Step 5: Recreate foreign key constraints with next_auth.users references
ALTER TABLE projects
  ADD CONSTRAINT projects_created_by_fkey
  FOREIGN KEY (created_by)
  REFERENCES next_auth.users(id)
  ON DELETE SET NULL;

ALTER TABLE metadata_components
  ADD CONSTRAINT metadata_components_created_by_fkey
  FOREIGN KEY (created_by)
  REFERENCES next_auth.users(id)
  ON DELETE SET NULL;

-- Step 6: Recreate indexes
CREATE INDEX idx_projects_created_by ON projects(created_by);
CREATE INDEX idx_metadata_components_created_by ON metadata_components(created_by);
