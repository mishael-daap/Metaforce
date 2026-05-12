import { NextResponse } from "next/server";
import { auth } from "@/app/auth";
import { supabase } from "@/lib/supabase";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: projectId } = await params;

    // Fetch project to verify ownership
    const { data: project, error: projectError } = await supabase
      .from("projects")
      .select("*")
      .eq("id", projectId)
      .single();

    if (projectError || !project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    // Verify user owns this project
    const userEmail = session.user.email;
    const { data: user, error: userError } = await supabase
      .schema("next_auth")
      .from("users")
      .select("id")
      .eq("email", userEmail)
      .single();

    if (userError || !user || project.created_by !== user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // Fetch metadata components for this project
    const { data: metadataComponents, error: metadataError } = await supabase
      .from("metadata_components")
      .select("*")
      .eq("project_id", projectId)
      .order("created_at", { ascending: false });

    if (metadataError) {
      console.error("Error fetching metadata components:", metadataError);
      return NextResponse.json(
        { error: "Failed to fetch metadata components" },
        { status: 500 }
      );
    }

    return NextResponse.json(metadataComponents || []);
  } catch (error) {
    console.error("Error fetching metadata components:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
