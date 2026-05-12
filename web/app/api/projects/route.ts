import { NextResponse } from "next/server";
import { auth } from "@/app/auth";
import { supabase } from "@/lib/supabase";

export async function GET() {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get user email from session
    const userEmail = session.user.email;

    // Fetch user from database
    const { data: user, error: userError } = await supabase
      .from("users")
      .select("id")
      .eq("email", userEmail)
      .single();

    if (userError || !user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Fetch projects created by this user
    const { data: projects, error: projectsError } = await supabase
      .from("projects")
      .select("*")
      .eq("created_by", user.id)
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

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    console.log(session.user)

    const body = await request.json();
    const { name, description } = body;

    if (!name || typeof name !== "string" || name.trim() === "") {
      return NextResponse.json(
        { error: "Project name is required" },
        { status: 400 }
      );
    }

    // Get user email from session
    const userEmail = session.user.email;

    // Fetch user from database
    const { data: user, error: userError } = await supabase
      .schema("next_auth")
      .from("users")
      .select("id")
      .eq("email", userEmail)
      .single();

      console.log(userError)

    if (userError || !user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Create project
    const { data: project, error: projectError } = await supabase
      .from("projects")
      .insert({
        name: name.trim(),
        description: description?.trim() || null,
        created_by: user.id,
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
      // Continue anyway, project is created
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