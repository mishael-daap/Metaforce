import { generateText } from "ai";
import { groq } from "@ai-sdk/groq";
import type { UIMessage } from "ai";
import {
  loadRecentMessages,
  getTotalMessageCount,
  loadMessageRange,
  updateConversationSummary,
} from "./chat-store";

const RECENT_WINDOW = 20;
const SUMMARIZE_EVERY = 20;
const SUMMARY_MAX_TOKENS = 400;
const SUMMARY_MODEL = groq("llama-3.1-8b-instant");

async function summarize(
  newMessages: UIMessage[],
  existingSummary: string | null,
  conversationId: string
): Promise<string> {
  const { text, usage } = await generateText({
    model: SUMMARY_MODEL,
    maxOutputTokens: SUMMARY_MAX_TOKENS,
    system: `You are a context summarizer for a Salesforce assistant
Merge the existing summary with the new messages into ONE updated summary.
No preamble. Summary text only.
Always preserve: decisions made, entities created, key facts, pending actions, Salesforce records mentioned.
Drop older less important details to make room for new ones.`,
    prompt: `Existing summary:\n${existingSummary ?? "None yet."}\n\nNew messages:\n${JSON.stringify(newMessages)}\n\nReturn updated summary now.`,
  });

  return text;
}

export async function getOptimizedContext({
  conversationId,
  summary,
  lastSummarizedIndex,
}: {
  conversationId: string;
  summary: string | null;
  lastSummarizedIndex: number;
}): Promise<{ summaryContext: string; messages: UIMessage[] }> {
  const totalCount = await getTotalMessageCount(conversationId);

  const oldMessageCount = Math.max(0, totalCount - RECENT_WINDOW);

  const unsummarizedCount = oldMessageCount - lastSummarizedIndex;

  let currentSummary = summary;

  if (unsummarizedCount >= SUMMARIZE_EVERY) {
    const unsummarizedMessages = await loadMessageRange(
      conversationId,
      lastSummarizedIndex,
      oldMessageCount
    );

    currentSummary = await summarize(
      unsummarizedMessages,
      summary,
      conversationId
    );

    await updateConversationSummary({
      conversationId,
      summary: currentSummary,
      lastSummarizedIndex: oldMessageCount,
    });

  }

  const recentMessages = await loadRecentMessages(
    conversationId,
    RECENT_WINDOW
  );

  return {
    summaryContext: currentSummary ?? "",
    messages: recentMessages,
  };
}
