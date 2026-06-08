import { NextResponse } from "next/server";
import { auth } from "@/app/auth";
import { supabase } from "@/lib/supabase";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ projectId: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { projectId } = await params;

    // Verify project exists and caller owns it
    const { data: project, error: projectError } = await supabase
      .from("projects")
      .select("id, created_by")
      .eq("id", projectId)
      .single();

    if (projectError || !project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    if (project.created_by !== session.user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // Fetch org — never return the access_token to the client
    const { data: org, error: orgError } = await supabase
      .from("orgs")
      .select("domain_url, username")
      .eq("project_id", projectId)
      .single();

    if (orgError || !org) {
      return NextResponse.json(
        { error: "Org not found for this project" },
        { status: 404 }
      );
    }

    return NextResponse.json(org);
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
