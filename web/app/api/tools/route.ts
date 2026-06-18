import { auth } from "@/app/auth";
import { supabase } from "@/lib/supabase";
import {
  createRequirement,
  getRequirements,
  getRequirement,
  updateRequirement,
  deleteRequirement,
  getPendingRequirements,
} from "@/lib/tools/executors/requirements";
import { checkJobStatus } from "@/lib/tools/executors/jobs";
import {
  queueCreateObjectJob,
  queueUpdateObjectJob,
  queueDeleteObjectJob,
  queueCreateFieldJob,
  queueUpdateFieldJob,
  queueDeleteFieldJob,
} from "@/lib/tools/executors/sfdx";

export async function POST(req: Request) {
  const body = await req.json();
  const { toolName, input, projectId } = body;

  // Validation
  if (!toolName || !projectId) {
    return new Response(
      JSON.stringify({ error: "Missing toolName or projectId" }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }

  // Auth
  const session = await auth();
  if (!session?.user?.id) {
    return new Response(
      JSON.stringify({ error: "Unauthorized" }),
      { status: 401, headers: { "Content-Type": "application/json" } }
    );
  }

  // Ownership check
  const { data: project, error: projectError } = await supabase
    .from("projects")
    .select("created_by")
    .eq("id", projectId)
    .single();

  if (projectError || !project || project.created_by !== session.user.id) {
    return new Response(
      JSON.stringify({ error: "Unauthorized" }),
      { status: 403, headers: { "Content-Type": "application/json" } }
    );
  }

  // Route and execute
  try {
    let result: unknown;

    switch (toolName) {
      case "createRequirement":
        result = await createRequirement(projectId, input);
        break;
      case "getRequirements":
        result = await getRequirements(projectId, input?.status);
        break;
      case "getRequirement":
        result = await getRequirement(projectId, input?.requirementId);
        break;
      case "updateRequirement":
        result = await updateRequirement(projectId, input?.requirementId, input);
        break;
      case "deleteRequirement":
        result = await deleteRequirement(projectId, input?.requirementId);
        break;
      case "getPendingRequirements":
        result = await getPendingRequirements(projectId);
        break;
      case "checkJobStatus":
        result = await checkJobStatus(projectId);
        break;
      case "createObject":
        result = await queueCreateObjectJob(projectId, input);
        break;
      case "updateObject":
        result = await queueUpdateObjectJob(projectId, input?.apiName, input?.updates);
        break;
      case "deleteObject":
        result = await queueDeleteObjectJob(projectId, input?.apiName);
        break;
      case "createField":
        result = await queueCreateFieldJob(projectId, input?.objectName, input?.field);
        break;
      case "updateField":
        result = await queueUpdateFieldJob(projectId, input?.objectName, input?.fieldName, input?.field);
        break;
      case "deleteField":
        result = await queueDeleteFieldJob(projectId, input?.objectName, input?.fieldName);
        break;
      default:
        return new Response(
          JSON.stringify({ error: `Unknown tool: ${toolName}` }),
          { status: 400, headers: { "Content-Type": "application/json" } }
        );
    }

    return new Response(JSON.stringify(result), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (err: any) {
    console.error(`[Tools] Error executing ${toolName}:`, err);
    return new Response(
      JSON.stringify({ error: err.message || "Tool execution failed" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
