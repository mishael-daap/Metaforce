# Authentication

Google OAuth via NextAuth v5. Supabase adapter stores sessions in the `next_auth` schema. Middleware guards `/dashboard/*` only.

**Files:** `app/auth.ts`, `app/api/auth/[...nextauth]/route.ts`, `proxy.ts`, `lib/supabase.ts`, `lib/supabase-client.ts`, `app/(auth)/register/page.tsx`, `app/(auth)/signin/page.tsx`, `app/(auth)/signout/page.tsx`

## Sequence Diagram
```mermaid
sequenceDiagram
    participant U as User
    participant M as Middleware (proxy.ts)
    participant NA as NextAuth (app/auth.ts)
    participant G as Google OAuth
    participant S as Supabase (next_auth schema)

    alt Visit /dashboard/* without session
        U->>M: Visit dashboard route
        M->>NA: auth()
        NA->>S: Look up session
        S-->>NA: No session
        NA-->>M: null
        M-->>U: Redirect to /register
    else Visit /dashboard/* with session
        U->>M: Visit dashboard route
        M->>NA: auth()
        NA->>S: Look up session
        S-->>NA: Session found
        NA-->>M: session
        M-->>U: Allow through
    end

    alt First sign-in (no account)
        U->>NA: Click "Sign up with Google"
        NA->>G: Redirect to OAuth
        G-->>U: Present Google login
        U->>G: Enter credentials, approve
        G->>NA: Callback with auth code
        NA->>S: Create user + session in next_auth
        S-->>NA: Session created
        NA-->>U: Redirect to /
    else Returning user (existing account)
        U->>NA: Click "Sign in with Google"
        NA->>G: Redirect to OAuth
        G-->>U: Present Google login
        U->>G: Enter credentials, approve
        G->>NA: Callback with auth code
        NA->>S: Look up existing user + create session
        S-->>NA: Session found + created
        NA-->>U: Redirect to /
    end

    alt Sign out
        U->>NA: Click "Sign out"
        NA->>S: Delete session
        S-->>NA: Session deleted
        NA-->>U: Redirect to /signin
    else Cancel sign-in (error)
        U->>NA: Authenticate cancelled
        NA-->>U: Stay on sign-in page (isLoading resets)
    end
```

## Session Distribution

Session data reaches the frontend through two separate paths:

- **Root layout** (`app/layout.tsx`) calls `auth()` server-side, then passes the session to `<SessionProvider>` so client components use `useSession()` / `signIn()` / `signOut()` from `next-auth/react`.
- **API routes** call `auth()` directly to get the session, then look up the Supabase user by email in the `next_auth` schema.
