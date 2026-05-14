"use client";

import { useState, useEffect } from "react";
import { UIMessage, useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { MessageCircle } from "lucide-react";
import { PromptInputMessage, PromptInput, PromptInputTextarea, PromptInputSubmit } from "@/src/components/ai-elements/prompt-input";
import { Conversation, ConversationContent, ConversationEmptyState } from "@/src/components/ai-elements/conversation";
import { Message, MessageContent, MessageResponse } from "@/src/components/ai-elements/message";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable"
import { File } from "lucide-react";
import { supabase } from "@/lib/supabase-client";

export function Chat({
  projectId,
  initialMessages,
}: {
  projectId: string;
  initialMessages: UIMessage[];
}) {
  const [input, setInput] = useState("");

  const { messages, sendMessage, status } = useChat({
    id: projectId,
    messages: initialMessages,
    transport: new DefaultChatTransport({
      api: "/api/projectchat",
      prepareSendMessagesRequest({ messages, id }) {
        return {
          body: {
            messages,
            projectId: id,
          },
        };
      },
    }),
  });

  const handleSubmit = (message: PromptInputMessage) => {
    if (message.text.trim()) {
      sendMessage({ text: message.text });
      setInput("");
    }
  };

  return (
    <div className="flex flex-col ">
      <Conversation className="flex-1 overflow-y-auto scrollbar-thin">
        <ConversationContent>
          {messages.length === 0 ? (
            <ConversationEmptyState
              icon={<MessageCircle className="size-12" />}
              title="Start a conversation"
              description="Type a message below to begin chatting"
            />
          ) : (
            messages.map((message) => (
              <Message from={message.role} key={message.id}>
                <MessageContent>
                  {message.parts.map((part, i) => {
                    switch (part.type) {
                      case "text":
                        return (
                          <MessageResponse key={`${message.id}-${i}`}>
                            {part.text}
                          </MessageResponse>
                        );
                      default:
                        return null;
                    }
                  })}
                </MessageContent>
              </Message>
            ))
          )}
        </ConversationContent>
      </Conversation>

      <div className="sticky bottom-0 bg-background p-4">
        <PromptInput onSubmit={handleSubmit} className="w-full max-w-2xl mx-auto">
          <PromptInputTextarea
            value={input}
            placeholder="What are you working on?"
            onChange={(e) => setInput(e.currentTarget.value)}
          />
          <PromptInputSubmit
            status={status === "streaming" ? "streaming" : "ready"}
            disabled={!input.trim()}
            className="absolute bottom-1 right-1"
          />
        </PromptInput>
      </div>
    </div>
  );
}

export default function ProjectChat({
  projectId,
  initialMessages,
}: {
  projectId: string;
  initialMessages: UIMessage[];
}) {
  const [showPanel, setShowPanel] = useState(false);
  const [projectName, setProjectName] = useState(projectId);

  useEffect(() => {
    const fetchProjectName = async () => {
      try {
        const { data, error } = await supabase
          .from("projects")
          .select("name")
          .eq("id", projectId)
          .single();

        if (error) {
          console.error("Error fetching project:", error);
        } else if (data && data.name) {
          setProjectName(data.name);
        }
      } catch (err) {
        console.error("Failed to fetch project name:", err);
      }
    };

    fetchProjectName();
  }, [projectId]);

  return (
    // top bar
    <div className="h-screen flex flex-col p-4 overflow-hidden">
      <div className="flex justify-between items-center">
        <div className="text-lg font-medium">{projectName}</div>

        <File  onClick={() => setShowPanel(p => !p)} className="cursor-pointer"/>

      </div>
      <ResizablePanelGroup
      orientation="horizontal"
      className="w-screen"
    >
      <ResizablePanel defaultSize="60%">
        <Chat projectId={projectId} initialMessages={initialMessages} />
      </ResizablePanel>

      <ResizableHandle  className="bg-transparent" withHandle/>

      {showPanel && <ResizablePanel className="pt-4 pr-4 pb-4 animate-in slide-in-from-right">
        <div className="flex h-full items-center justify-center p-6 rounded-lg border">
          <span className="font-semibold">small panel</span>
        </div>
      </ResizablePanel>}
    </ResizablePanelGroup>
    </div>)
}