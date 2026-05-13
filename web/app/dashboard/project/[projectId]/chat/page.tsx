import { getConversationForProject, createConversation, loadMessages } from "@/lib/chat-store";
import  ProjectChat  from "./project-chat";

export default async function ProjectChatPage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = await params;

  const conversation =
    (await getConversationForProject(projectId)) ??
    (await createConversation(projectId));

  const messages = await loadMessages(conversation.id);

  return <ProjectChat projectId={projectId} initialMessages={messages} />;
}