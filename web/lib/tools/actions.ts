import { tool } from "ai";
import { z } from "zod";
import { supabase } from "@/lib/supabase";

export function createActionTools() {
  return {
    createAction: tool({
      description:
        "Create a new action for a requirement. Use to define a concrete SFDX tool call.",
      inputSchema: z.object({
        requirementId: z.string().uuid().describe("The requirement id this action belongs to"),
        description: z.string().describe("What this action does"),
        tool: z
          .enum(["sfdx_create_object", "sfdx_create_field", "sfdx_delete", "sfdx_update"])
          .describe("The SFDX tool to use"),
        parameters: z.record(z.unknown()).describe("Parameters for the SFDX tool"),
      }),
      execute: async ({ requirementId, description, tool, parameters }) => {
        const { data, error } = await supabase
          .from("actions")
          .insert({
            requirement_id: requirementId,
            description,
            tool,
            parameters,
            status: "pending",
          })
          .select()
          .single();

        if (error) {
          throw new Error(`Failed to create action: ${error.message}`);
        }

        return {
          success: true,
          action: data,
        };
      },
    }),

    getActions: tool({
      description: "Get all actions for a requirement.",
      inputSchema: z.object({
        requirementId: z.string().uuid().describe("The requirement id"),
        status: z
          .enum(["pending", "approved", "in_progress", "completed", "failed"])
          .optional()
          .describe("Filter by status"),
      }),
      execute: async ({ requirementId, status }) => {
        let query = supabase
          .from("actions")
          .select("*")
          .eq("requirement_id", requirementId)
          .order("created_at", { ascending: true });

        if (status) {
          query = query.eq("status", status);
        }

        const { data, error } = await query;

        if (error) {
          throw new Error(`Failed to fetch actions: ${error.message}`);
        }

        return {
          actions: data || [],
        };
      },
    }),

    getAction: tool({
      description: "Get a specific action by its id (UUID).",
      inputSchema: z.object({
        actionId: z.string().uuid().describe("The action id"),
      }),
      execute: async ({ actionId }) => {
        const { data, error } = await supabase
          .from("actions")
          .select("*")
          .eq("id", actionId)
          .single();

        if (error) {
          throw new Error(`Failed to fetch action: ${error.message}`);
        }

        if (!data) {
          throw new Error("Action not found");
        }

        return {
          action: data,
        };
      },
    }),

    updateAction: tool({
      description: "Update an action. Use to change status, fix errors, or update details.",
      inputSchema: z.object({
        actionId: z.string().uuid().describe("The action id"),
        description: z.string().optional().describe("New description"),
        status: z
          .enum(["pending", "approved", "in_progress", "completed", "failed"])
          .optional()
          .describe("New status"),
        errorMessage: z.string().optional().describe("Error message if failed"),
        suggestedFix: z.record(z.unknown()).optional().describe("Suggested fix for failed action"),
      }),
      execute: async ({ actionId, description, status, errorMessage, suggestedFix }) => {
        const updateData: Record<string, unknown> = {};
        if (description !== undefined) updateData.description = description;
        if (status !== undefined) updateData.status = status;
        if (errorMessage !== undefined) updateData.error_message = errorMessage;
        if (suggestedFix !== undefined) updateData.suggested_fix = suggestedFix;

        const { data, error } = await supabase
          .from("actions")
          .update(updateData)
          .eq("id", actionId)
          .select()
          .single();

        if (error) {
          throw new Error(`Failed to update action: ${error.message}`);
        }

        if (!data) {
          return { error: "Action not found" };
        }

        return {
          success: true,
          action: data,
        };
      },
    }),

    deleteAction: tool({
      description: "Delete an action. Use only after user confirmation.",
      inputSchema: z.object({
        actionId: z.string().uuid().describe("The action id"),
      }),
      execute: async ({ actionId }) => {
        const { error } = await supabase.from("actions").delete().eq("id", actionId);

        if (error) {
          throw new Error(`Failed to delete action: ${error.message}`);
        }

        return {
          success: true,
        };
      },
    }),
  };
}
