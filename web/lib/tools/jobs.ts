import { tool } from "ai";
import { z } from "zod";
import { supabase } from "@/lib/supabase";

export function createJobStatusTools(projectId: string) {
  const checkJobStatus = tool({
    description:
      "Check the status of jobs for this project. Call this at the start of EVERY Build Mode interaction to see if any previously queued jobs have completed or failed. Returns a summary of the most recent pending, in_progress, completed, and failed jobs.",
    inputSchema: z.object({}),
    execute: async () => {
      const { data, error } = await supabase
        .from("jobs")
        .select("*")
        .eq("project_id", projectId)
        .order("created_at", { ascending: false })
        .limit(10);

      if (error) {
        return {
          success: false,
          error: `Failed to check job status: ${error.message}`,
        };
      }

      if (!data || data.length === 0) {
        return {
          success: true,
          message: "No jobs found for this project.",
          jobs: [],
        };
      }

      const jobs = data.map((job) => ({
        id: job.id,
        type: job.type,
        status: job.status,
        result: job.result,
        error_message: job.error_message,
        created_at: job.created_at,
        completed_at: job.completed_at,
      }));

      // Summarize
      const pending = jobs.filter((j) => j.status === "pending").length;
      const inProgress = jobs.filter((j) => j.status === "in_progress").length;
      const completed = jobs.filter((j) => j.status === "completed").length;
      const failed = jobs.filter((j) => j.status === "failed").length;

      return {
        success: true,
        summary: {
          total: jobs.length,
          pending,
          inProgress,
          completed,
          failed,
        },
        jobs,
        message:
          pending > 0 || inProgress > 0
            ? `There are ${pending} pending and ${inProgress} in-progress jobs. Please wait for them to complete before proceeding.`
            : `All jobs are settled. ${completed} completed, ${failed} failed.`,
      };
    },
  });

  return {
    checkJobStatus,
  };
}
