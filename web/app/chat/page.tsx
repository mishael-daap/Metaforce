"use client";
import { useState } from "react";
import { useChat } from "@ai-sdk/react";
import { PromptInputMessage } from "@/src/components/ai-elements/prompt-input";
import {
  Conversation,
  ConversationContent,
  ConversationEmptyState,
} from "@/src/components/ai-elements/conversation";
import {
  Message,
  MessageContent,
  MessageResponse,
} from "@/src/components/ai-elements/message";
import { MessageCircle } from "lucide-react";
import {
  PromptInput,
  PromptInputTextarea,
  PromptInputSubmit,
} from "@/src/components/ai-elements/prompt-input";

export default function Page() {
  const [input, setInput] = useState("");
  const { messages, sendMessage, status } = useChat();
  const handleSubmit = (message: PromptInputMessage) => {
    if (message.text.trim()) {
      sendMessage({ text: message.text });
      setInput("");
    }
  };
  return (
    <div className="flex flex-col h-screen">
      <Conversation className="flex-1 overflow-y-auto">
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
        <PromptInput
          onSubmit={handleSubmit}
          className="w-full max-w-2xl mx-auto"
        >
          <PromptInputTextarea
            value={input}
            placeholder="What are you working on?"
            onChange={(e) => setInput(e.currentTarget.value)}
            className=""
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
