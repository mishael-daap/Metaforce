import { groq } from "@ai-sdk/groq";
import {
  streamText,
  convertToModelMessages,
  createIdGenerator,
  tool,
  stepCountIs,
} from "ai";
import { wrapLanguageModel } from "ai";
import { devToolsMiddleware } from "@ai-sdk/devtools";
import {
  getConversationForProject,
  loadMessages,
  saveMessages,
} from "@/lib/chat-store";
import type { UIMessage } from "ai";
import { createRequirementTools } from "@/lib/tools/requirements";
import { createSfdxTools } from "@/lib/tools/sfdx";
import { getRequirementsPrompt } from "@/lib/tools/prompts/requirements";
import { getBuildPlanPrompt } from "@/lib/tools/prompts/build";
import { supabase } from "@/lib/supabase";

export const maxDuration = 30;

const model = wrapLanguageModel({
  model: groq("openai/gpt-oss-120b"),
  middleware: devToolsMiddleware(),
});

async function handlePlanMode({ messages, projectId, projectName, projectDescription, conversationId }) {
  console.log("messages", messages, "projectid", projectId, "projectName", projectName, "projectDescription", projectDescription, "conversation id", conversationId)
  const result = streamText({
    model,
    system: getRequirementsPrompt(projectName, projectDescription),
    tools: { ...createRequirementTools(projectId) },
    messages: await convertToModelMessages(messages),
    stopWhen: stepCountIs(50),
  });

  return result.toUIMessageStreamResponse({
    originalMessages: messages,
    generateMessageId: createIdGenerator({ prefix: "msg", size: 16 }),
    onFinish: ({ responseMessage }) => {
      if (!conversationId) return;
      console.log(" ai response message", responseMessage)
      saveMessages({ conversationId, messages: [responseMessage] }).catch(console.error);
    },
  });
}

async function handleBuildMode({ messages, projectId, projectName, projectDescription, conversationId }) {
  console.log("messages", messages, "projectid", projectId, "projectName", projectName, "projectDescription", projectDescription, "conversation id", conversationId)
  const result = streamText({
    model,
    system: getBuildPlanPrompt(projectName, projectDescription),
    tools: { ...createRequirementTools(projectId), ...createSfdxTools({ projectId, accessToken: "00DgK00000FEwjR!AQEAQBe.VpQJBpgsVVdlQJs9wy0kbpBZcv9tDx9Zh7gD9syprjjroK9mKFHgvWc6eaKH5nwbelV0BZGpKCHrwXfU4C4.db", orgUrl: "https://orgfarm-cf567c8e83-dev-ed.develop.my.salesforce.com" }) },
    messages: await convertToModelMessages(messages),
    stopWhen: stepCountIs(50),
  });

  return result.toUIMessageStreamResponse({
    originalMessages: messages,
    generateMessageId: createIdGenerator({ prefix: "msg", size: 16 }),
    onFinish: ({ responseMessage }) => {
      if (!conversationId) return;
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

  let chatHistory: UIMessage[] = [];

  if (projectId) {
    const conversation = await getConversationForProject(projectId);
    if (conversation) {
      conversationId = conversation.id;
      console.log("conversation id is", conversationId);
      // Load full history from DB — the DB is source of truth, not the client.
      // We only trust the new user message from the client; everything
      // else is loaded fresh to prevent tampered or truncated history.
      chatHistory = await loadMessages(conversation.id);
      messages = [...chatHistory, newUserMessage];
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
    return handlePlanMode({ messages, projectId, projectName, projectDescription, conversationId });
  } else if (mode === "build") {
    return handleBuildMode({ messages, projectId, projectName, projectDescription, conversationId });
  } else {
    return new Response("Bad Request: unknown mode", { status: 400 });
  }
}