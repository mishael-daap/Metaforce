'use server';

import { supabase } from "@/lib/supabase";
import { revalidatePath } from "next/cache";

export async function getProjectRequirements(projectId: string) {
  try {
    const { data, error } = await supabase
      .from("requirements")
      .select("*")
      .eq("project_id", projectId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching requirements:", error);
      return [];
    }

    return data || [];
  } catch (err) {
    console.error("Failed to fetch requirements:", err);
    return [];
  }
}

export async function updateRequirement(
  requirementId: string,
  title: string,
  description: string,
  projectId: string
) {
  try {
    const { data, error } = await supabase
      .from("requirements")
      .update({ title, description })
      .eq("id", requirementId)
      .eq("project_id", projectId)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update requirement: ${error.message}`);
    }

    // Revalidate the path to update the UI
    revalidatePath(`/project/${projectId}`);

    return { success: true, requirement: data };
  } catch (err) {
    console.error("Error updating requirement:", err);
    return { error: "Failed to update requirement" };
  }
}

export async function deleteRequirement(
  requirementId: string,
  projectId: string
) {
  try {
    const { error } = await supabase
      .from("requirements")
      .delete()
      .eq("id", requirementId)
      .eq("project_id", projectId);

    if (error) {
      throw new Error(`Failed to delete requirement: ${error.message}`);
    }

    // Revalidate the path to update the UI
    revalidatePath(`/project/${projectId}`);

    return { success: true };
  } catch (err) {
    console.error("Error deleting requirement:", err);
    return { error: "Failed to delete requirement" };
  }
}