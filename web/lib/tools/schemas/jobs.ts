import { tool } from "ai";
import { z } from "zod";

/**
 * Schema-only job status tool for streamText.
 * Execution happens server-side via /api/tools.
 */
export function jobStatusToolSchema() {
  return {
    checkJobStatus: tool({
      description:
        "Check the status of jobs for this project. Call this at the start of EVERY Build Mode interaction to see if any previously queued jobs have completed or failed. Returns a summary of the most recent pending, in_progress, completed, and failed jobs.",
      inputSchema: z.object({}),
    }),
  };
}
