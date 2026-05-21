import { groq } from "@ai-sdk/groq";
import {
  streamText,
  convertToModelMessages,
  createIdGenerator,
  stepCountIs,
} from "ai";
import { wrapLanguageModel } from "ai";
import { devToolsMiddleware } from "@ai-sdk/devtools";
import {
  getConversationForProject,
  saveMessages,
} from "@/lib/chat-store";
import { getOptimizedContext } from "@/lib/conversationMemory";
import type { UIMessage } from "ai";
import { createRequirementTools } from "@/lib/tools/requirements";
import { createSfdxTools } from "@/lib/tools/sfdx";
import { getRequirementsPrompt } from "@/lib/tools/prompts/requirements";
import { getBuildPlanPrompt } from "@/lib/tools/prompts/build";
import { supabase } from "@/lib/supabase";

import { createOpenAICompatible } from '@ai-sdk/openai-compatible';

const nim = createOpenAICompatible({
  name: 'nim',
  baseURL: 'https://integrate.api.nvidia.com/v1',
  headers: {
    Authorization: `Bearer ${process.env.NIM_API_KEY}`,
  },
});

export const maxDuration = 30;

// const model = wrapLanguageModel({
//   model: groq("openai/gpt-oss-120b"),
//   middleware: devToolsMiddleware(),
// });

const model = wrapLanguageModel({
  model: nim.chatModel('nvidia/nemotron-3-super-120b-a12b'),
  middleware: devToolsMiddleware(),
});

async function handlePlanMode({ messages, projectId, projectName, projectDescription, conversationId, summaryContext }) {
  console.log("messages", messages, "projectid", projectId, "projectName", projectName, "projectDescription", projectDescription, "conversation id", conversationId)
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
    onFinish: ({ responseMessage, usage }) => {
      if (!conversationId) return;
      console.log(`[request-tokens] conversationId=${conversationId}`, {
        promptTokens: usage?.promptTokens,
        completionTokens: usage?.completionTokens,
        totalTokens: usage?.totalTokens,
      });
      console.log(" ai response message", responseMessage)
      saveMessages({ conversationId, messages: [responseMessage] }).catch(console.error);
    },
  });
}

async function handleBuildMode({ messages, projectId, projectName, projectDescription, conversationId, summaryContext }) {
  console.log("messages", messages, "projectid", projectId, "projectName", projectName, "projectDescription", projectDescription, "conversation id", conversationId)
  const result = streamText({
    model,
    system: `${getBuildPlanPrompt(projectName, projectDescription)}${summaryContext ? `\n## Conversation History Summary\n${summaryContext}` : ""}`,
    tools: { ...createRequirementTools(projectId), ...createSfdxTools({ projectId, accessToken: "00DgK00000FEwjR!AQEAQNQ2HvBchlnITDyVv_TbjNGytlY0e9wuO608LrT1fKTy7SS6OEe1jwDzHWZcC0eSQHv_5Ce7GvYK961Pr3Zq0GSaYvso", orgUrl: "https://orgfarm-cf567c8e83-dev-ed.develop.my.salesforce.com" }) },
    messages: await convertToModelMessages(messages),
    stopWhen: stepCountIs(50),
  });

  return result.toUIMessageStreamResponse({
    originalMessages: messages,
    generateMessageId: createIdGenerator({ prefix: "msg", size: 16 }),
    onFinish: ({ responseMessage, usage }) => {
      if (!conversationId) return;
      console.log(`[request-tokens] conversationId=${conversationId}`, {
        promptTokens: usage?.promptTokens,
        completionTokens: usage?.completionTokens,
        totalTokens: usage?.totalTokens,
      });
      saveMessages({ conversationId, messages: [responseMessage] }).catch(console.error);
    },
  });
}


export async function POST(req: Request) {
  const body = await req.json();
  const {
    messages: clientMessages,
    projectId,
    mode
  }: {
    messages: UIMessage[];
    projectId?: string;
    mode: string
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
      console.log("conversation id is", conversationId);
      const { summaryContext: ctx, messages: optimizedMessages } = await getOptimizedContext({
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
    console.log("new user message is", newUserMessage)
    await saveMessages({ conversationId, messages: [newUserMessage] });
  }

   if (mode === "plan") {
    console.log("were in plan mode")
    return handlePlanMode({ messages, projectId, projectName, projectDescription, conversationId, summaryContext });
  } else if (mode === "build") {
    return handleBuildMode({ messages, projectId, projectName, projectDescription, conversationId, summaryContext });
  } else {
    return new Response("Bad Request: unknown mode", { status: 400 });
  }
}