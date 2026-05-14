import nextAuth from "next-auth";
import Google from "next-auth/providers/google";

import { SupabaseAdapter } from "@auth/supabase-adapter";

export const { auth, handlers, signIn, signOut } = nextAuth({
  providers: [Google],

  adapter: SupabaseAdapter({
    url: process.env.NEXT_PUBLIC_SUPABASE_URL!,
    secret: process.env.SUPABASE_SERVICE_ROLE_KEY!,
  }),
});