import { supabase } from "@/lib/supabase";

export async function createRequirement(
  projectId: string,
  { title, description }: { title: string; description: string }
) {
  const { data, error } = await supabase
    .from("requirements")
    .insert({
      project_id: projectId,
      title,
      description,
      status: "pending",
    })
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to create requirement: ${error.message}`);
  }

  return {
    success: true,
    requirement: data,
  };
}

export async function getRequirements(
  projectId: string,
  status?: string
) {
  let query = supabase
    .from("requirements")
    .select("*")
    .eq("project_id", projectId)
    .order("created_at", { ascending: false });

  if (status) {
    query = query.eq("status", status);
  }

  const { data, error } = await query;

  if (error) {
    throw new Error(`Failed to fetch requirements: ${error.message}`);
  }

  return {
    requirements: data || [],
  };
}

export async function getRequirement(
  projectId: string,
  requirementId: string
) {
  const { data, error } = await supabase
    .from("requirements")
    .select("*")
    .eq("id", requirementId)
    .eq("project_id", projectId)
    .single();

  if (error) {
    throw new Error(`Failed to fetch requirement: ${error.message}`);
  }

  if (!data) {
    return { error: "Requirement not found" };
  }

  return {
    requirement: data,
  };
}

export async function updateRequirement(
  projectId: string,
  requirementId: string,
  updates: { title?: string; description?: string; status?: string }
) {
  const updateData: Record<string, unknown> = {};
  if (updates.title !== undefined) updateData.title = updates.title;
  if (updates.description !== undefined) updateData.description = updates.description;
  if (updates.status !== undefined) updateData.status = updates.status;

  const { data, error } = await supabase
    .from("requirements")
    .update(updateData)
    .eq("id", requirementId)
    .eq("project_id", projectId)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to update requirement: ${error.message}`);
  }

  if (!data) {
    return { error: "Requirement not found" };
  }

  return {
    success: true,
    requirement: data,
  };
}

export async function deleteRequirement(
  projectId: string,
  requirementId: string
) {
  const { error } = await supabase
    .from("requirements")
    .delete()
    .eq("id", requirementId)
    .eq("project_id", projectId);

  if (error) {
    throw new Error(`Failed to delete requirement: ${error.message}`);
  }

  return {
    success: true,
  };
}

export async function getPendingRequirements(projectId: string) {
  const { data, error } = await supabase
    .from("requirements")
    .select("*")
    .eq("project_id", projectId)
    .in("status", ["pending", "planned"])
    .order("created_at", { ascending: true })
    .limit(1);

  if (error) {
    throw new Error(`Failed to fetch pending requirements: ${error.message}`);
  }

  return {
    requirements: data || [],
  };
}
