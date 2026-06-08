import { NextResponse } from "next/server";
import { auth } from "@/app/auth";
import { supabase } from "@/lib/supabase";
import { fetchLatest } from "@/lib/sfdx/project";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ projectId: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { projectId } = await params;

    // Verify project ownership
    const { data: project, error: projectError } = await supabase
      .from("projects")
      .select("id")
      .eq("id", projectId)
      .single();

    if (projectError || !project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    if (project.created_by !== session.user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // Fetch org credentials (access_token not returned to client, used server-side)
    const { data: org, error: orgError } = await supabase
      .from("orgs")
      .select("domain_url, access_token")
      .eq("project_id", projectId)
      .single();

    if (orgError || !org) {
      return NextResponse.json(
        { error: "Org not found for this project" },
        { status: 404 }
      );
    }

    const result = await fetchLatest(
      projectId,
      org.access_token,
      org.domain_url
    );

    if (!result.success) {
      return NextResponse.json(
        { error: result.error ?? "Fetch latest failed" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, data: result.data });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
