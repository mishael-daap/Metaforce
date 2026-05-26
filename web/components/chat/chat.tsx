"use client";

import { useState } from "react";
import { UIMessage, useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { MessageCircle } from "lucide-react";
import { PromptInputMessage, PromptInput, PromptInputTextarea, PromptInputSubmit } from "@/src/components/ai-elements/prompt-input";
import { Conversation, ConversationContent, ConversationEmptyState } from "@/src/components/ai-elements/conversation";
import { Message, MessageContent, MessageResponse } from "@/src/components/ai-elements/message";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ChatProps {
  projectId: string;
  initialMessages: UIMessage[];
  onFinish?: (messages: UIMessage[]) => void;
  mode: "plan" | "build";
  setMode: React.Dispatch<React.SetStateAction<"plan" | "build">>;
}

export function Chat({ projectId, initialMessages, onFinish, mode, setMode }: ChatProps) {
  const [input, setInput] = useState("");

  const { messages, sendMessage, status } = useChat({
    id: projectId,
    messages: initialMessages,
    transport: new DefaultChatTransport({
      api: "/api/projectchat",
      prepareSendMessagesRequest({ messages, id, body }) {
        return { body: { messages, projectId: id, ...body } };
      },
    }),
    onFinish: async ({ messages: finalMessages }) => {
      onFinish?.(finalMessages);
    },
  });

  const handleSubmit = (message: PromptInputMessage) => {
    if (message.text.trim()) {
      sendMessage({ text: message.text }, { body: { projectId, mode } });
      setInput("");
    }
  };

  return (
    <div className="flex flex-col">
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

          <Button
            variant="ghost"
            size="sm"
            onClick={() => setMode(mode === "plan" ? "build" : "plan")}
            className={cn(
              "absolute bottom-1 left-1 h-7 px-2 rounded-full border transition-colors",
              mode === "build"
                ? "bg-primary text-primary-foreground border-primary hover:bg-primary/90"
                : "border-border text-muted-foreground hover:bg-accent"
            )}
          >
            <span className="text-xs capitalize">{mode}</span>
          </Button>

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