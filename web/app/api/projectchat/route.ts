import { groq } from "@ai-sdk/groq";
import { streamText, convertToModelMessages, createIdGenerator, tool, stepCountIs } from "ai";
import { wrapLanguageModel } from "ai";
import { devToolsMiddleware } from "@ai-sdk/devtools";
import {
  getConversationForProject,
  loadMessages,
  saveMessages,
} from "@/lib/chat-store";
import type { UIMessage } from "ai";
import { createRequirementTools } from "@/lib/tools/requirements";
// import { createAction, getActions, getAction, updateAction, deleteAction } from "@/lib/tools/actions";
import { getRequirementsPrompt } from "@/lib/prompts";
import { supabase } from "@/lib/supabase";

export const maxDuration = 30;

const model = wrapLanguageModel({
  model: groq("meta-llama/llama-4-scout-17b-16e-instruct"),
  middleware: devToolsMiddleware(),
});

export async function POST(req: Request) {
  const body = await req.json();
  const { messages: clientMessages, projectId }: {
    messages: UIMessage[];
    projectId?: string;
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

  if (projectId) {
    const conversation = await getConversationForProject(projectId);
    if (conversation) {
      conversationId = conversation.id;
      // Load full history from DB — the DB is source of truth, not the client.
      // We only trust the new user message from the client; everything
      // else is loaded fresh to prevent tampered or truncated history.
      const history = await loadMessages(conversation.id);
      messages = [...history, newUserMessage];
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

  const result = streamText({
    model,
    system: getRequirementsPrompt(projectName, projectDescription),
    tools: {...createRequirementTools(projectId!) },
    messages: await convertToModelMessages(messages),
    stopWhen: stepCountIs(10)
  });

  // consumeStream() without await detaches stream completion from the
  // client connection — onFinish fires even if the user closes the tab
  result.consumeStream();

  return result.toUIMessageStreamResponse({
    // originalMessages is the full context so the SDK builds the complete
    // final array (history + assistant response) before passing to onFinish
    originalMessages: messages,
    // Server-side IDs ensure assistant messages always get a stable
    // non-empty id — prevents upsert failures in Supabase
    generateMessageId: createIdGenerator({ prefix: "msg", size: 16 }),
    onFinish: ({ messages: finalMessages }) => {
      if (!conversationId) return;

      saveMessages({
        conversationId,
        messages: finalMessages,
      }).catch((err) => {
        console.error("Failed to save messages:", err);
      });
    },
  });
}