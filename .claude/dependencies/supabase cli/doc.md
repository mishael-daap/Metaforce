# Lean Supabase Cloud CLI Docs (Windows + pnpm)

A minimal reference for working with hosted Supabase projects using the Supabase CLI.

---

# 1. Install the CLI

## Using pnpm

```bash
pnpm add -D supabase
```

## Verify

```bash
pnpm supabase --version
```

---

# 2. Login

Authenticate the CLI with your Supabase account.

```bash
pnpm supabase login
```

---

# 3. Initialize Supabase

Inside your project root:

```bash
pnpm supabase init
```

This creates:

```text
supabase/
  migrations/
  config.toml
```

---

# 4. Link to a Cloud Project

Find your project ref from:

```text
https://supabase.com/dashboard/project/<project-ref>
```

Link the local project:

```bash
pnpm supabase link --project-ref your-project-ref
```

---

# 5. Create a Migration

```bash
pnpm supabase migration new create_profiles_table
```

Generated file:

```text
supabase/migrations/
  20260507120000_create_profiles_table.sql
```

Example SQL:

```sql
create table profiles (
  id uuid primary key default gen_random_uuid(),
  username text unique not null,
  created_at timestamptz default now()
);
```

---

# 6. Push Migrations to the Cloud Database

Apply local migrations to the hosted database:

```bash
pnpm supabase db push
```

This is the main deployment command.

---

# 7. Pull Remote Schema Changes

If someone changed the schema directly in the dashboard:

```bash
pnpm supabase db pull
```

Best practice:

* avoid dashboard schema edits
* use migrations instead

---

# 8. Generate TypeScript Types

Generate types from the linked cloud database:

```bash
pnpm supabase gen types typescript --linked > src/types/database.ts
```

Useful for type-safe Supabase queries.

---

# 9. View Migration Status

```bash
pnpm supabase migration list
```

Shows:

* local migrations
* remote migrations
* applied status

---

# 10. Repair Migration History

Mark a migration as applied:

```bash
pnpm supabase migration repair --status applied <timestamp>
```

Mark as reverted:

```bash
pnpm supabase migration repair --status reverted <timestamp>
```

Use carefully.

---

# 11. Local Reset (Optional)

If using local Supabase with Docker:

```bash
pnpm supabase db reset
```

This:

* recreates the local database
* reruns migrations
* reruns seed data

Does NOT affect production.

---

# 12. Important Files

## Migrations

```text
supabase/migrations/
```

## Config

```text
supabase/config.toml
```

## Seed File

```text
supabase/seed.sql
```

---

# 13. Recommended Workflow

## Standard Flow

```text
1. Create migration
2. Write SQL
3. Push to cloud
4. Generate types
5. Commit to git
```

---

# 14. Example Workflow

## Create Migration

```bash
pnpm supabase migration new add_profiles
```

## Write SQL

```sql
create table profiles (
  id uuid primary key default gen_random_uuid(),
  email text unique not null
);
```

## Push Changes

```bash
pnpm supabase db push
```

## Generate Types

```bash
pnpm supabase gen types typescript --linked > src/types/database.ts
```

## Commit

```bash
git add .
git commit -m "add profiles table"
```

---

# 15. Best Practices

## Use Migrations for Everything

Do not edit production schemas manually unless necessary.

---

## Commit Migrations

Always commit:

```text
supabase/migrations/
```

---

## Generate Types Frequently

After schema changes:

```bash
pnpm supabase gen types typescript --linked > src/types/database.ts
```

---

## Keep Git and Database in Sync

Your migration files should fully reproduce your database schema.

---

# 16. Core Commands Cheat Sheet

## Login

```bash
pnpm supabase login
```

## Initialize

```bash
pnpm supabase init
```

## Link Project

```bash
pnpm supabase link --project-ref your-project-ref
```

## Create Migration

```bash
pnpm supabase migration new migration_name
```

## Push to Cloud

```bash
pnpm supabase db push
```

## Pull Remote Changes

```bash
pnpm supabase db pull
```

## Generate Types

```bash
pnpm supabase gen types typescript --linked
```

## View Migrations

```bash
pnpm supabase migration list
```
