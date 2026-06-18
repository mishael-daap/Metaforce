import { tool } from "ai";
import { z } from "zod";

/**
 * Schema-only requirement tools for streamText.
 * Execution happens server-side via /api/tools.
 */
export function requirementToolSchemas() {
  return {
    createRequirement: tool({
      description:
        "Create a new requirement. Use after discussing and confirming what the user needs.",
      inputSchema: z.object({
        title: z.string().describe("Short, clear title for the requirement"),
        description: z.string().describe("Detailed description of the requirement"),
      }),
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
    }),

    getRequirement: tool({
      description: "Get a specific requirement by its id (UUID).",
      inputSchema: z.object({
        requirementId: z.string().uuid().describe("The requirement id"),
      }),
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
    }),

    deleteRequirement: tool({
      description: "Delete a requirement. Use only after user confirmation.",
      inputSchema: z.object({
        requirementId: z.string().uuid().describe("The requirement id"),
      }),
    }),

    getPendingRequirements: tool({
      description:
        "Get the first pending or planned requirement for the current project. Use to find the next requirement to work on.",
      inputSchema: z.object({}),
    }),
  };
}
