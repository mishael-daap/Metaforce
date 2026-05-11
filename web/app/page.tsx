"use client";
import { useSession, signIn, signOut } from "next-auth/react";

export default function Home() {
  const { data: session } = useSession();

  return (
    <nav>
      <div>{session?.user?.name}</div>
      <button onClick={() => signIn("salesforce", { redirectTo: "/" })}>Sign In</button>
      <button onClick={() => signOut({ redirectTo: "/client" })}>Sign Out</button>
    </nav>
  );
}