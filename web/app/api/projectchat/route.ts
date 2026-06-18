import {
  streamText,
  convertToModelMessages,
  createIdGenerator,
} from "ai";
import { wrapLanguageModel } from "ai";
import { devToolsMiddleware } from "@ai-sdk/devtools";
import { auth } from "@/app/auth";
import { getConversationForProject, loadMessages, saveMessages } from "@/lib/chat-store";
import type { UIMessage } from "ai";
import { requirementToolSchemas } from "@/lib/tools/schemas/requirements";
import { sfdxToolSchemas } from "@/lib/tools/schemas/sfdx";
import { jobStatusToolSchema } from "@/lib/tools/schemas/jobs";
import { getRequirementsPrompt } from "@/lib/tools/prompts/requirements";
import { getBuildPlanPrompt } from "@/lib/tools/prompts/build";
import { supabase } from "@/lib/supabase";
import { createOpenAICompatible } from "@ai-sdk/openai-compatible";

const nim = createOpenAICompatible({
  name: "nim",
  baseURL: "https://integrate.api.nvidia.com/v1",
  headers: {
    Authorization: `Bearer ${process.env.NIM_API_KEY}`,
  },
});

export const maxDuration = 60;

const baseModel = nim.chatModel("nvidia/nemotron-3-super-120b-a12b");

const model =
  process.env.NODE_ENV === "development"
    ? wrapLanguageModel({ model: baseModel, middleware: devToolsMiddleware() })
    : baseModel;

interface ModeHandlerParams {
  messages: UIMessage[];
  projectId: string;
  projectName: string;
  projectDescription: string;
  conversationId: string | undefined;
}

async function handlePlanMode({
  messages,
  projectId,
  projectName,
  projectDescription,
  conversationId,
}: ModeHandlerParams) {
  console.log("[PlanMode] Starting streamText", { conversationId, messageCount: messages.length });

  const result = streamText({
    model,
    system: getRequirementsPrompt(projectName, projectDescription),
    tools: { ...requirementToolSchemas() },
    messages: await convertToModelMessages(messages),
  });

  return result.toUIMessageStreamResponse({
    originalMessages: messages,
    generateMessageId: createIdGenerator({ prefix: "msg", size: 16 }),
    onFinish: ({ responseMessage }) => {
      console.log("[PlanMode] onFinish fired, responseMessage.id:", responseMessage.id);
      if (!conversationId) {
        console.warn("[PlanMode] No conversationId, skipping save");
        return;
      }
      saveMessages({ conversationId, messages: [responseMessage] }).catch(
        (err) => console.error("[PlanMode] saveMessages error:", err)
      );
    },
  });
}

async function handleBuildMode({
  messages,
  projectId,
  projectName,
  projectDescription,
  conversationId,
}: ModeHandlerParams) {
  console.log("[BuildMode] Starting streamText", { conversationId, messageCount: messages.length });

  const result = streamText({
    model,
    system: getBuildPlanPrompt(projectName, projectDescription),
    tools: {
      ...requirementToolSchemas(),
      ...sfdxToolSchemas(),
      ...jobStatusToolSchema(),
    },
    messages: await convertToModelMessages(messages),
  });

  return result.toUIMessageStreamResponse({
    originalMessages: messages,
    generateMessageId: createIdGenerator({ prefix: "msg", size: 16 }),
    onFinish: async ({ responseMessage }) => {
      console.log("[BuildMode] onFinish fired, responseMessage.id:", responseMessage.id);
      if (!conversationId) {
        console.warn("[BuildMode] No conversationId, skipping save");
        return;
      }
      try {
        await saveMessages({ conversationId, messages: [responseMessage] });
        console.log("[BuildMode] Assistant message saved to DB");
      } catch (err) {
        console.error("[BuildMode] Failed to save assistant message:", err);
      }
    },
  });
}

export async function POST(req: Request) {
  console.log("\n[Chat] ========== NEW REQUEST ==========");

  const body = await req.json();
  const { projectId } = body;

  console.log("[Chat] Request body:", { projectId, mode: body.mode, messageCount: body.messages?.length });

  if (!projectId) {
    return new Response("Bad Request: missing projectId", { status: 400 });
  }

  // ── Ownership check ──────────────────────────────────────────
  const session = await auth();
  if (!session?.user?.id) {
    console.warn("[Chat] No session, returning 401");
    return new Response("Unauthorized", { status: 401 });
  }

  const { data: project, error: projectError } = await supabase
    .from("projects")
    .select("id, created_by")
    .eq("id", projectId)
    .single();

  if (projectError || !project) {
    console.warn("[Chat] Project not found:", projectId);
    return new Response("Project not found", { status: 404 });
  }

  console.log("[Chat] Ownership check:", {
    projectId,
    sessionUserId: session.user.id,
    projectOwner: project.created_by
  });

  if (project.created_by !== session.user.id) {
    console.warn("[Chat] Ownership mismatch — returning 403");
    return new Response("Unauthorized", { status: 403 });
  }
  console.log("[Chat] Ownership check passed");

  const { messages: clientMessages, mode } = body;

  if (!Array.isArray(clientMessages) || clientMessages.length === 0) {
    return new Response("Bad Request: missing messages", { status: 400 });
  }

  const newUserMessage = clientMessages[clientMessages.length - 1];
  console.log("[Chat] User message received:", { id: newUserMessage?.id, role: newUserMessage?.role });

  let conversationId: string | undefined;
  let messages: UIMessage[] = [newUserMessage];
  let projectName = "not provided";
  let projectDescription = "not provided";

  if (projectId) {
    const conversation = await getConversationForProject(projectId);
    if (conversation) {
      conversationId = conversation.id;
      const allMessages = await loadMessages(conversation.id);
      messages = [...allMessages.slice(-50), newUserMessage];
      console.log("[Chat] Loaded", allMessages.length, "messages from DB, total for context:", messages.length);
    } else {
      console.log("[Chat] No conversation found, using just new message");
    }

    try {
      const { data } = await supabase
        .from("projects")
        .select("name, description")
        .eq("id", projectId)
        .single();
      if (data) {
        projectName = data.name ?? "not provided";
        projectDescription = data.description ?? "not provided";
      }
    } catch (err) {
      console.error("[Chat] Error fetching project:", err);
    }
  }

  if (conversationId) {
    await saveMessages({ conversationId, messages: [newUserMessage] });
    console.log("[Chat] User message saved to DB, id:", newUserMessage.id);
  }

  console.log("[Chat] Routing to", mode, "with", messages.length, "messages (last ID:", messages[messages.length - 1]?.id + ", role: " + messages[messages.length - 1]?.role + ")");

  if (mode === "plan") {
    return handlePlanMode({ messages, projectId, projectName, projectDescription, conversationId });
  } else if (mode === "build") {
    return handleBuildMode({ messages, projectId, projectName, projectDescription, conversationId });
  } else {
    return new Response("Bad Request: unknown mode", { status: 400 });
  }
}
