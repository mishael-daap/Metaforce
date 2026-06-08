import { NextResponse } from "next/server";
import { auth } from "@/app/auth";
import { supabase } from "@/lib/supabase";
import { setupProject } from "@/lib/sfdx/project";

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
    const body = await request.json();
    const { accessToken } = body as { accessToken?: string };

    if (!accessToken || typeof accessToken !== "string" || !accessToken.trim()) {
      return NextResponse.json(
        { error: "Access token is required" },
        { status: 400 }
      );
    }

    // Verify project ownership
    const { data: project, error: projectError } = await supabase
      .from("projects")
      .select("id",)
      .eq("id", projectId)
      .single();

    if (projectError || !project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    console.log(project)

    if (project.created_by !== session.user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // Fetch org URL (not returned to client, only used server-side)
    const { data: org, error: orgError } = await supabase
      .from("orgs")
      .select("domain_url")
      .eq("project_id", projectId)
      .single();

    if (orgError || !org) {
      return NextResponse.json(
        { error: "Org not found for this project" },
        { status: 404 }
      );
    }

    const result = await setupProject(
      projectId,
      accessToken.trim(),
      org.domain_url
    );

    if (!result.success) {
      return NextResponse.json(
        { error: result.error ?? "Project setup failed" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, data: result.data });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
