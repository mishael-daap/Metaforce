import { groq } from "@ai-sdk/groq";
import {
  streamText,
  convertToModelMessages,
  createIdGenerator,
  stepCountIs,
} from "ai";
import { wrapLanguageModel } from "ai";
import { devToolsMiddleware } from "@ai-sdk/devtools";
import { auth } from "@/app/auth";
import { getConversationForProject, saveMessages } from "@/lib/chat-store";
import { getOptimizedContext } from "@/lib/conversationMemory";
import type { UIMessage } from "ai";
import { createRequirementTools } from "@/lib/tools/requirements";
// import { createSfdxTools } from "@/lib/tools/sfdx";
import { getRequirementsPrompt } from "@/lib/tools/prompts/requirements";
import { getBuildPlanPrompt } from "@/lib/tools/prompts/build";
import { supabase } from "@/lib/supabase";
import { createOpenAICompatible } from "@ai-sdk/openai-compatible";
import { createSfdxTools } from "@/lib/sfdx/sfdx.index";

const nim = createOpenAICompatible({
  name: "nim",
  baseURL: "https://integrate.api.nvidia.com/v1",
  headers: {
    Authorization: `Bearer ${process.env.NIM_API_KEY}`,
  },
});

export const maxDuration = 60;

console.log("this is the sfdx server api key", process.env.SFDX_SERVER_API_KEY);
console.log("this is the sfdx server url", process.env.SFDX_SERVER_URL);

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
  summaryContext: string;
}

async function handlePlanMode({
  messages,
  projectId,
  projectName,
  projectDescription,
  conversationId,
  summaryContext,
}: ModeHandlerParams) {
  const result = streamText({
    model,
    system: `${getRequirementsPrompt(projectName, projectDescription)}${
      summaryContext ? `\n## Conversation History Summary\n${summaryContext}` : ""
    }`,
    tools: { ...createRequirementTools(projectId) },
    messages: await convertToModelMessages(messages),
    stopWhen: stepCountIs(50),
  });

  return result.toUIMessageStreamResponse({
    originalMessages: messages,
    generateMessageId: createIdGenerator({ prefix: "msg", size: 16 }),
    onFinish: ({ responseMessage }) => {
      if (!conversationId) return;
      saveMessages({ conversationId, messages: [responseMessage] }).catch(
        console.error
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
  summaryContext,
}: ModeHandlerParams) {
  if (!process.env.SFDX_SERVER_API_KEY || !process.env.SFDX_SERVER_URL) {
    console.error("SFDX server configuration is missing");
    return new Response(
      "Internal Server Error: SFDX server not configured",
      { status: 500 }
    );
  }

  let BuildTools;
  try {
    BuildTools = createSfdxTools({
      baseUrl: process.env.SFDX_SERVER_URL!,
      apiKey: process.env.SFDX_SERVER_API_KEY!,
      projectId,
    });
    console.log("[DEBUG] SFDX tools created successfully");
  } catch (e) {
    console.error("[DEBUG] Failed to create SFDX tools:", e);
    throw e;
  }

  const result = streamText({
    model,
    system: `${getBuildPlanPrompt(projectName, projectDescription)}${
      summaryContext ? `\n## Conversation History Summary\n${summaryContext}` : ""
    }`,
    tools: { ...createRequirementTools(projectId), ...BuildTools },
    messages: await convertToModelMessages(messages),
    stopWhen: stepCountIs(50),
  });

  return result.toUIMessageStreamResponse({
    originalMessages: messages,
    generateMessageId: createIdGenerator({ prefix: "msg", size: 16 }),
    // More robust save pattern
    onFinish: async ({ responseMessage }) => {
      if (!conversationId) {
        console.warn("[DEBUG] No conversationId, skipping save");
        return;
      }
      try {
        await saveMessages({ conversationId, messages: [responseMessage] });
        console.log("[DEBUG] Assistant message saved");
      } catch (err) {
        console.error("[DEBUG] Failed to save assistant message:", err);
      }
    },
  });
}

export async function POST(req: Request) {
  const body = await req.json();

  // At the very top of POST, log the environment state
  console.log("[DEBUG] Environment check:", {
    hasSfdxKey: !!process.env.SFDX_SERVER_API_KEY,
    hasSfdxUrl: !!process.env.SFDX_SERVER_URL,
    nodeEnv: process.env.NODE_ENV,
    projectId: body.projectId,
    mode: body.mode,
  });

  // ── Ownership check ──────────────────────────────────────────
  // Every other API route validates that the caller owns the project
  // before touching any data. The chat route was missing this gate
  // entirely — without it any authenticated user who guesses a
  // projectId can read its conversation and trigger SFDX commands
  // against its connected org.
  const session = await auth();
  if (!session?.user?.id) {
    return new Response("Unauthorized", { status: 401 });
  }

  const { projectId } = body;
  if (!projectId) {
    return new Response("Bad Request: missing projectId", { status: 400 });
  }

  const { data: project, error: projectError } = await supabase
    .from("projects")
    .select("id")
    .eq("id", projectId)
    .single();

  if (projectError || !project) {
    return new Response("Project not found", { status: 404 });
  }

  if (project.created_by !== session.user.id) {
    return new Response("Unauthorized", { status: 403 });
  }
  // ─────────────────────────────────────────────────────────────

  const {
    messages: clientMessages,
    mode,
  }: {
    messages: UIMessage[];
    mode: string;
  } = body;

  // Validate incoming data before touching the DB
  if (!Array.isArray(clientMessages) || clientMessages.length === 0) {
    return new Response("Bad Request: missing messages", { status: 400 });
  }

  const newUserMessage = clientMessages[clientMessages.length - 1];

  if (!newUserMessage?.role || !Array.isArray(newUserMessage?.parts)) {
    return new Response("Bad Request: invalid message shape", { status: 400 });
  }

  let conversationId: string | undefined;
  // Start with just the new message as fallback if no projectId
  let messages: UIMessage[] = [newUserMessage];
  let projectName = "not provided";
  let projectDescription = "not provided";

  let summaryContext = "";

  if (projectId) {
    const conversation = await getConversationForProject(projectId);
    if (conversation) {
      conversationId = conversation.id;
      const { summaryContext: ctx, messages: optimizedMessages } =
        await getOptimizedContext({
          conversationId: conversation.id,
          summary: conversation.summary,
          lastSummarizedIndex: conversation.last_summarized_index ?? 0,
        });
      summaryContext = ctx;
      messages = [...optimizedMessages, newUserMessage];
    }
    // Fetch project details to enrich the prompt
    try {
      const { data, error } = await supabase
        .from("projects")
        .select("name, description")
        .eq("id", projectId)
        .single();

      if (error) {
        console.error("Failed to fetch project:", error);
      } else if (data) {
        projectName = data.name ?? "not provided";
        projectDescription = data.description ?? "not provided";
      }
    } catch (err) {
      console.error("Error fetching project:", err);
    }
  }

  if (conversationId) {
    await saveMessages({ conversationId, messages: [newUserMessage] });
  }

  if (mode === "plan") {
    return handlePlanMode({
      messages,
      projectId,
      projectName,
      projectDescription,
      conversationId,
      summaryContext,
    });
  } else if (mode === "build") {
    return handleBuildMode({
      messages,
      projectId,
      projectName,
      projectDescription,
      conversationId,
      summaryContext,
    });
  } else {
    return new Response("Bad Request: unknown mode", { status: 400 });
  }
}
