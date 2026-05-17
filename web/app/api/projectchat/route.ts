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
// Action tools removed as per new architecture
import { getRequirementsPrompt } from "@/lib/tools/prompts/requirements";
import { supabase } from "@/lib/supabase";

export const maxDuration = 30;

const model = wrapLanguageModel({
  model: groq("openai/gpt-oss-120b"),
  middleware: devToolsMiddleware(),
});

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

  console.log("mode is", mode)

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

  console.log("project id is", projectId);

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

  const result = streamText({
    model,
    system: getRequirementsPrompt(projectName, projectDescription),
    tools: { ...createRequirementTools(projectId!) },
    messages: await convertToModelMessages(messages),
    stopWhen: stepCountIs(10),
  });

  return result.toUIMessageStreamResponse({
    // originalMessages is the full context so the SDK builds the complete
    // final array (history + assistant response) before passing to onFinish
    originalMessages: messages,
    // Server-side IDs ensure assistant messages always get a stable
    // non-empty id — prevents upsert failures in Supabase
    generateMessageId: createIdGenerator({ prefix: "msg", size: 16 }),
    onFinish: ({ messages: finalMessages, responseMessage }) => {
      if (!conversationId) return;

      console.log("user message is", responseMessage);

      saveMessages({ conversationId, messages: [responseMessage] }).catch(
        (err) => console.error("Failed to save messages:", err),
      );
    },
  });
}
