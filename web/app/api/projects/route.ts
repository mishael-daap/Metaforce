import { NextResponse } from "next/server";
import { auth } from "@/app/auth";
import { supabase } from "@/lib/supabase";

export async function GET() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: projects, error: projectsError } = await supabase
      .from("projects")
      .select("*")
      .eq("created_by", session.user.id)
      .order("created_at", { ascending: false });

    if (projectsError) {
      return NextResponse.json(
        { error: "Failed to fetch projects" },
        { status: 500 }
      );
    }

    return NextResponse.json(projects || []);
  } catch (error) {
    console.error("Error fetching projects:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { name, description, org } = body;

    if (!name || typeof name !== "string" || name.trim() === "") {
      return NextResponse.json(
        { error: "Project name is required" },
        { status: 400 }
      );
    }

    if (!org || !org.domain_url || !org.username || !org.access_token) {
      return NextResponse.json(
        { error: "Org details (instance URL, username, access token) are required" },
        { status: 400 }
      );
    }

    // Create project
    const { data: project, error: projectError } = await supabase
      .from("projects")
      .insert({
        name: name.trim(),
        description: description?.trim() || null,
        created_by: session.user.id,
      })
      .select()
      .single();

    if (projectError) {
      console.error("Error creating project:", projectError);
      return NextResponse.json(
        { error: "Failed to create project" },
        { status: 500 }
      );
    }

    // Create conversation for this project
    const { error: conversationError } = await supabase
      .from("conversations")
      .insert({
        project_id: project.id,
      });

    if (conversationError) {
      console.error("Error creating conversation:", conversationError);
    }

    // Create org for this project
    const { error: orgError } = await supabase.from("orgs").insert({
      project_id: project.id,
      domain_url: org.domain_url.trim(),
      username: org.username.trim(),
      access_token: org.access_token.trim(),
    });

    if (orgError) {
      console.error("Error creating org:", orgError);
      return NextResponse.json(
        { error: "Project created but failed to create org" },
        { status: 500 }
      );
    }

    return NextResponse.json(project, { status: 201 });
  } catch (error) {
    console.error("Error creating project:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
