# Lean Supabase Cloud CLI Docs (Windows + pnpx)

A minimal reference for working with hosted Supabase projects using the Supabase CLI.
---

# 2. Login

Authenticate the CLI with your Supabase account.

```bash
pnpx supabase login
```

---

# 3. Initialize Supabase

Inside your project root:

```bash
pnpx supabase init
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
pnpx supabase link --project-ref rpcoxcpgcqtkwthphtau
```

---

# 5. Create a Migration

```bash
pnpx supabase migration new create_profiles_table
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
pnpx supabase db push
```

This is the main deployment command.

---

# 7. Pull Remote Schema Changes

If someone changed the schema directly in the dashboard:

```bash
pnpx supabase db pull
```

Best practice:

* avoid dashboard schema edits
* use migrations instead

---

# 8. Generate TypeScript Types

Generate types from the linked cloud database:

```bash
pnpx supabase gen types typescript --linked > src/types/database.ts
```

Useful for type-safe Supabase queries.

---

# 9. View Migration Status

```bash
pnpx supabase migration list
```

Shows:

* local migrations
* remote migrations
* applied status

---

# 10. Repair Migration History

Mark a migration as applied:

```bash
pnpx supabase migration repair --status applied <timestamp>
```

Mark as reverted:

```bash
pnpx supabase migration repair --status reverted <timestamp>
```

Use carefully.

---

# 11. Local Reset (Optional)

If using local Supabase with Docker:

```bash
pnpx supabase db reset
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
pnpx supabase migration new add_profiles
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
pnpx supabase db push
```

## Generate Types

```bash
pnpx supabase gen types typescript --linked > src/types/database.ts
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
pnpx supabase gen types typescript --linked > src/types/database.ts
```

---

## Keep Git and Database in Sync

Your migration files should fully reproduce your database schema.

---

# 16. Core Commands Cheat Sheet

## Login

```bash
pnpx supabase login
```

## Initialize

```bash
pnpx supabase init
```

## Link Project

```bash
pnpx supabase link --project-ref your-project-ref
```

## Create Migration

```bash
pnpx supabase migration new migration_name
```

## Push to Cloud

```bash
pnpx supabase db push
```

## Pull Remote Changes

```bash
pnpx supabase db pull
```

## Generate Types

```bash
pnpx supabase gen types typescript --linked
```

## View Migrations

```bash
pnpx supabase migration list
```
