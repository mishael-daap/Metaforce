import { tool } from "ai";
import { z } from "zod";
import { supabase } from "@/lib/supabase";

export function createRequirementTools(projectId: string) {
  console.log("project id from prompt", projectId)
  return {
    createRequirement: tool({
      description:
        "Create a new requirement. Use after discussing and confirming what the user needs.",
      inputSchema: z.object({
        title: z.string().describe("Short, clear title for the requirement"),
        description: z
          .string()
          .describe("Detailed description of the requirement"),
      }),
      execute: async ({ title, description }) => {
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
      },
    }),

    getRequirements: tool({
      description:
        "Get all requirements for the current project. Use to list or summarize existing requirements.",
      inputSchema: z.object({
        status: z
          .enum(["pending", "planned", "completed", "cancelled"])
          .optional()
          .describe("Filter by status"),
      }),
      execute: async ({ status }) => {
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
      },
    }),

    getRequirement: tool({
      description: "Get a specific requirement by its id (UUID).",
      inputSchema: z.object({
        requirementId: z.string().uuid().describe("The requirement id"),
      }),
      execute: async ({ requirementId }) => {
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
      },
    }),

    updateRequirement: tool({
      description:
        "Update a requirement. Use after user confirms edits or when a requirement state changes.",
      inputSchema: z.object({
        requirementId: z.string().uuid().describe("The requirement id"),
        title: z.string().optional().describe("New title"),
        description: z.string().optional().describe("New description"),
        status: z
          .enum(["pending", "planned", "completed", "cancelled"])
          .optional()
          .describe("New status"),
      }),
      execute: async ({ requirementId, title, description, status }) => {
        const updateData: Record<string, unknown> = {};
        if (title !== undefined) updateData.title = title;
        if (description !== undefined) updateData.description = description;
        if (status !== undefined) updateData.status = status;

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
      },
    }),

    deleteRequirement: tool({
      description: "Delete a requirement. Use only after user confirmation.",
      inputSchema: z.object({
        requirementId: z.string().uuid().describe("The requirement id"),
      }),
      execute: async ({ requirementId }) => {
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
      },
    }),

    getPendingRequirements: tool({
      description:
        "Get the first pending or planned requirement for the current project. Use to find the next requirement to work on.",
      inputSchema: z.object({}),
      execute: async () => {
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
      },
    }),

  };
}
