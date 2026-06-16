import { type SupabaseClient } from '@supabase/supabase-js';
import { executeJob } from './executor.js';

const POLL_INTERVAL_MS = 3000;
const STALE_JOB_THRESHOLD_MINUTES = 5;

interface JobRow {
  id: string;
  project_id: string;
  requirement_id: string | null;
  type: string;
  payload: Record<string, any>;
  status: string;
}

/**
 * Marks stale 'in_progress' jobs as 'pending' so they get picked up again.
 * Call this once on startup.
 */
export async function recoverStuckJobs(supabase: SupabaseClient): Promise<number> {
  const { data, error } = await supabase
    .from('jobs')
    .update({ status: 'pending', started_at: null })
    .eq('status', 'in_progress')
    .lt('started_at', new Date(Date.now() - STALE_JOB_THRESHOLD_MINUTES * 60 * 1000).toISOString())
    .select('id');

  if (error) {
    console.error('[Worker] Failed to recover stuck jobs:', error.message);
    return 0;
  }

  const recoveredCount = data?.length ?? 0;
  if (recoveredCount > 0) {
    console.log(`[Worker] Recovered ${recoveredCount} stuck job(s)`);
  }
  return recoveredCount;
}

/**
 * Claims and processes a single pending job.
 * Returns true if a job was processed, false otherwise.
 */
export async function processOneJob(supabase: SupabaseClient): Promise<boolean> {
  // Find the oldest pending job
  const { data: job, error: findError } = await supabase
    .from('jobs')
    .select('*')
    .eq('status', 'pending')
    .order('created_at', { ascending: true })
    .limit(1)
    .single<JobRow>();

  if (findError || !job) {
    // No pending jobs
    return false;
  }

  console.log(`[Worker] Claiming job ${job.id} (${job.type})`);

  // Claim the job: update status to in_progress
  const { error: claimError } = await supabase
    .from('jobs')
    .update({
      status: 'in_progress',
      started_at: new Date().toISOString(),
    })
    .eq('id', job.id)
    .eq('status', 'pending');

  if (claimError) {
    console.error(`[Worker] Failed to claim job ${job.id}:`, claimError.message);
    return true; // Return true to prevent tight-loop spam when claiming fails
  }

  // Execute the job
  try {
    const result = await executeJob(job);

    if (result.success) {
      await supabase
        .from('jobs')
        .update({
          status: 'completed',
          result: { components: result.components },
          completed_at: new Date().toISOString(),
        })
        .eq('id', job.id);

      console.log(`[Worker] Job ${job.id} completed successfully`);
    } else {
      await supabase
        .from('jobs')
        .update({
          status: 'failed',
          error_message: result.error ?? 'Unknown error during job execution',
          completed_at: new Date().toISOString(),
        })
        .eq('id', job.id);

      console.log(`[Worker] Job ${job.id} failed: ${result.error}`);
    }
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error during job execution';

    await supabase
      .from('jobs')
      .update({
        status: 'failed',
        error_message: errorMessage,
        completed_at: new Date().toISOString(),
      })
      .eq('id', job.id);

    console.error(`[Worker] Job ${job.id} errored:`, errorMessage);
  }

  return true;
}

/**
 * Starts the worker polling loop.
 */
export async function startPolling(supabase: SupabaseClient) {
  console.log('[Worker] Starting job polling loop...');

  // Recover any stuck jobs from a previous crash
  await recoverStuckJobs(supabase);

  // Main polling loop
  const poll = async () => {
    try {
      const processed = await processOneJob(supabase);
      if (processed) {
        // If a job was processed, immediately check for more (reduces latency)
        setTimeout(poll, 100);
      } else {
        setTimeout(poll, POLL_INTERVAL_MS);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown polling error';
      console.error('[Worker] Polling error:', errorMessage);
      setTimeout(poll, POLL_INTERVAL_MS);
    }
  };

  poll();
}
