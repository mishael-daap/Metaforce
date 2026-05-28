import { groq } from "@ai-sdk/groq";
import {
  streamText,
  convertToModelMessages,
  createIdGenerator,
  stepCountIs,
} from "ai";
import { wrapLanguageModel } from "ai";
import { devToolsMiddleware } from "@ai-sdk/devtools";
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

export const maxDuration = 30;

console.log("this is the sfdx server api key", process.env.SFDX_SERVER_API_KEY)
console.log("this is the sfdx server url", process.env.SFDX_SERVER_URL)

const baseModel = nim.chatModel("nvidia/nemotron-3-super-120b-a12b");

const model = process.env.NODE_ENV === "development"
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
    system: `${getRequirementsPrompt(projectName, projectDescription)}${summaryContext ? `\n## Conversation History Summary\n${summaryContext}` : ""}`,
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
        console.error,
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

  if(!process.env.SFDX_SERVER_API_KEY || !process.env.SFDX_SERVER_URL) {
    console.error("SFDX server configuration is missing");
    return new Response("Internal Server Error: SFDX server not configured", { status: 500 });
  }
  
  const BuildTools = createSfdxTools({
    baseUrl: process.env.SFDX_SERVER_URL,
    apiKey: process.env.SFDX_SERVER_API_KEY,
    projectId,
  });

  const result = streamText({
    model,
    system: `${getBuildPlanPrompt(projectName, projectDescription)}${summaryContext ? `\n## Conversation History Summary\n${summaryContext}` : ""}`,
    tools: { ...createRequirementTools(projectId), ...BuildTools },
    messages: await convertToModelMessages(messages),
    stopWhen: stepCountIs(50),
  });

  return result.toUIMessageStreamResponse({
    originalMessages: messages,
    generateMessageId: createIdGenerator({ prefix: "msg", size: 16 }),
    onFinish: ({ responseMessage }) => {
  if (!conversationId) return;
  saveMessages({ conversationId, messages: [responseMessage] }).catch(
    console.error,
  );
},
  });
}

export async function POST(req: Request) {
  const body = await req.json();
  const {
    messages: clientMessages,
    projectId,
    mode,
  }: {
    messages: UIMessage[];
    projectId?: string;
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


    if (!projectId) {
  return new Response("Bad Request: missing projectId", { status: 400 });
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
