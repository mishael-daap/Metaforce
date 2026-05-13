import { supabase } from "./supabase";
import { UIMessage } from "ai";

export async function getConversationForProject(
  projectId: string
): Promise<{ id: string } | null> {
  const { data, error } = await supabase
    .from("conversations")
    .select("id")
    .eq("project_id", projectId)
    .maybeSingle();

  if (error) throw new Error(`Failed to get conversation: ${error.message}`);
  return data;
}

export async function createConversation(
  projectId: string
): Promise<{ id: string }> {
  const { data, error } = await supabase
    .from("conversations")
    .insert({ project_id: projectId })
    .select("id")
    .single();

  if (error) throw new Error(`Failed to create conversation: ${error.message}`);
  return data;
}

export async function loadMessages(conversationId: string): Promise<UIMessage[]> {
  const { data, error } = await supabase
    .from("messages")
    .select("ui_message")
    .eq("conversation_id", conversationId)
    .order("created_at", { ascending: true });

  if (error) throw new Error(`Failed to load messages: ${error.message}`);

  if (!data || data.length === 0) return [];

  return data
    .map((row) => row.ui_message as UIMessage)
    // Filter out any malformed rows that could break convertToModelMessages
    .filter((m) => m && m.id && m.role && Array.isArray(m.parts));
}

export async function saveMessages({
  conversationId,
  messages,
}: {
  conversationId: string;
  messages: UIMessage[];
}): Promise<void> {
  if (!messages || messages.length === 0) return;

  // Filter out malformed or empty messages before saving —
  // an empty assistant message saved to DB corrupts history on next load
  const validMessages = messages.filter(
    (m) =>
      m?.id &&
      m?.role &&
      Array.isArray(m?.parts) &&
      m.parts.some((p: any) => p.type === "text" && p.text?.trim())
  );

  if (validMessages.length === 0) return;

  // Upsert on message id rather than delete-then-insert —
  // if the insert step fails with delete-then-insert you lose all history.
  // Upsert is atomic and safe to call multiple times.
  const { error } = await supabase.from("messages").upsert(
    validMessages.map((msg) => ({
      id: msg.id,
      conversation_id: conversationId,
      ui_message: msg,
      created_at: new Date().toISOString(),
    })),
    { onConflict: "id" }
  );

  if (error) throw new Error(`Failed to save messages: ${error.message}`);
}