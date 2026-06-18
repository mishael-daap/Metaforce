import { supabase } from "@/lib/supabase";
import { latestJobPerProject } from "@/lib/sfdx/job-tools";

async function insertJob(
  projectId: string,
  type: string,
  payload: Record<string, unknown>
) {
  const { data, error } = await supabase
    .from("jobs")
    .insert({
      project_id: projectId,
      type,
      payload: payload as any,
      status: "pending",
    })
    .select("id")
    .single();

  if (error) {
    throw new Error(`Failed to queue job: ${error.message}`);
  }

  latestJobPerProject.set(projectId, data.id);
  return data.id;
}

// -------------------------------------------------------
// Object Job Executors
// -------------------------------------------------------

export async function queueCreateObjectJob(
  projectId: string,
  payload: Record<string, unknown>
) {
  const jobId = await insertJob(projectId, "create_object", payload);
  return {
    jobId,
    status: "pending",
    message: `Job #${jobId} queued to create custom object "${(payload as any).fullName}".`,
  };
}

export async function queueUpdateObjectJob(
  projectId: string,
  apiName: string,
  updates: Record<string, unknown>
) {
  const jobId = await insertJob(projectId, "update_object", { apiName, updates });
  return {
    jobId,
    status: "pending",
    message: `Job #${jobId} queued to update custom object "${apiName}".`,
  };
}

export async function queueDeleteObjectJob(
  projectId: string,
  apiName: string
) {
  const jobId = await insertJob(projectId, "delete_object", { apiName });
  return {
    jobId,
    status: "pending",
    message: `Job #${jobId} queued to delete custom object "${apiName}".`,
  };
}

// -------------------------------------------------------
// Field Job Executors
// -------------------------------------------------------

export async function queueCreateFieldJob(
  projectId: string,
  objectName: string,
  field: Record<string, unknown>
) {
  const jobId = await insertJob(projectId, "create_field", { objectName, field });
  return {
    jobId,
    status: "pending",
    message: `Job #${jobId} queued to create field "${(field as any).fullName}" on object "${objectName}".`,
  };
}

export async function queueUpdateFieldJob(
  projectId: string,
  objectName: string,
  fieldName: string,
  field: Record<string, unknown>
) {
  const jobId = await insertJob(projectId, "update_field", { objectName, fieldName, field });
  return {
    jobId,
    status: "pending",
    message: `Job #${jobId} queued to update field "${fieldName}" on "${objectName}".`,
  };
}

export async function queueDeleteFieldJob(
  projectId: string,
  objectName: string,
  fieldName: string
) {
  const jobId = await insertJob(projectId, "delete_field", { objectName, fieldName });
  return {
    jobId,
    status: "pending",
    message: `Job #${jobId} queued to delete field "${fieldName}" from "${objectName}".`,
  };
}
