"use client";

import { useState } from "react";
import { UIMessage, useChat } from "@ai-sdk/react";
import { DefaultChatTransport, lastAssistantMessageIsCompleteWithToolCalls } from "ai";
import { MessageSquare } from "lucide-react";
import {
  PromptInputMessage,
  PromptInput,
  PromptInputTextarea,
  PromptInputSubmit,
} from "@/src/components/ai-elements/prompt-input";
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
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

import {
  ChainOfThought,
  ChainOfThoughtContent,
  ChainOfThoughtHeader,
  ChainOfThoughtStep,
} from "@/src/components/ai-elements/chain-of-thought";

import {
  Tool,
  ToolContent,
  ToolHeader,
  ToolInput,
  ToolOutput,
} from "@/src/components/ai-elements/tool";
import { type ToolUIPart } from "ai";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ProjectSetupModal } from "@/components/chat/project-setup-modal";
import { FetchLatestModal } from "@/components/chat/fetch-latest-modal";

interface ChatProps {
  projectId: string;
  initialMessages: UIMessage[];
  onFinish?: (messages: UIMessage[]) => void;
  mode: "plan" | "build";
  setMode: React.Dispatch<React.SetStateAction<"plan" | "build">>;
}

export function Chat({
  projectId,
  initialMessages,
  onFinish,
  mode,
  setMode,
}: ChatProps) {
  const [input, setInput] = useState("");
  const [setupModalOpen, setSetupModalOpen] = useState(false);
  const [fetchModalOpen, setFetchModalOpen] = useState(false);

  const { messages, sendMessage, addToolOutput, status, stop } = useChat({
    id: projectId,
    messages: initialMessages,
    transport: new DefaultChatTransport({
      api: "/api/projectchat",
      prepareSendMessagesRequest({ messages, id, body }) {
        return { body: { messages, projectId: id, ...body } };
      },
    }),
    sendAutomaticallyWhen: lastAssistantMessageIsCompleteWithToolCalls,
    onFinish: async ({ messages: finalMessages }) => {
      onFinish?.(finalMessages);
    },
    async onToolCall({ toolCall }) {
      if (toolCall.dynamic) return;

      const response = await fetch("/api/tools", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          toolName: toolCall.toolName,
          input: toolCall.input,
          projectId,
        }),
      });

      if (!response.ok) {
        addToolOutput({
          tool: toolCall.toolName,
          toolCallId: toolCall.toolCallId,
          state: "output-error",
          errorText: `Tool execution failed: ${await response.text()}`,
        });
        return;
      }

      const result = await response.json();

      addToolOutput({
        tool: toolCall.toolName,
        toolCallId: toolCall.toolCallId,
        output: result,
      });
    },
  });

  const isGenerating = status === "submitted" || status === "streaming";

  const handleSubmit = (message: PromptInputMessage) => {
    if (isGenerating) return;
    if (message.text.trim()) {
      sendMessage({ text: message.text }, { body: { projectId, mode } });
      setInput("");
    }
  };

  const toggleMode = () => {
    setMode((prev) => (prev === "plan" ? "build" : "plan"));
  };

  return (
    <div className="flex flex-col">
      <Conversation className="flex-1 overflow-y-auto scrollbar-thin">
        <ConversationContent>
          {messages.length === 0 ? (
            <ConversationEmptyState
              icon={<MessageSquare className="size-12" />}
              title="Start a conversation"
              description="Type a message below to begin chatting"
            />
          ) : (
            messages.map((message) => {
              const hasThinking = message.parts.some(
                (p) => p.type === "reasoning" || p.type.startsWith("tool-")
              );

              return (
                <Message from={message.role} key={message.id}>
                  <MessageContent>
                    {message.role === "assistant" && hasThinking && (
                      <ChainOfThought>
                        <ChainOfThoughtHeader>Thinking</ChainOfThoughtHeader>
                        <ChainOfThoughtContent>
                          {message.parts.map((part, i) => {
                            if (part.type === "reasoning") {
                              return (
                                <ChainOfThoughtStep
                                  key={`${message.id}-${i}`}
                                  label="Reasoning"
                                >
                                  {part.text}
                                </ChainOfThoughtStep>
                              );
                            }

                            if (part.type.startsWith("tool-")) {
                              const toolPart = part as ToolUIPart;
                              return (
                                <Tool key={`${message.id}-${i}`}>
                                  <ToolHeader
                                    type={toolPart.type}
                                    state={toolPart.state}
                                  />
                                  <ToolContent>
                                    <ToolInput input={toolPart.input} />
                                    <ToolOutput
                                      output={
                                        toolPart.output ? (
                                          <MessageResponse>
                                            {typeof toolPart.output ===
                                            "string"
                                              ? toolPart.output
                                              : JSON.stringify(
                                                  toolPart.output,
                                                  null,
                                                  2
                                                )}
                                          </MessageResponse>
                                        ) : undefined
                                      }
                                      errorText={toolPart.errorText}
                                    />
                                  </ToolContent>
                                </Tool>
                              );
                            }

                            return null;
                          })}
                        </ChainOfThoughtContent>
                      </ChainOfThought>
                    )}

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
              );
            })
          )}
        </ConversationContent>
      </Conversation>

      <div className="sticky bottom-0 bg-background p-4">
        <PromptInput
          onSubmit={handleSubmit}
          className="w-full max-w-2xl mx-auto"
          footer={
            <PromptInputSubmit
              status={isGenerating ? status : "ready"}
              onStop={stop}
              disabled={!isGenerating && !input.trim()}
              className="absolute bottom-1 right-1"
            />
          }
        >
          <PromptInputTextarea
            value={input}
            placeholder="What are you working on?"
            onChange={(e) => setInput(e.currentTarget.value)}
            disabled={isGenerating}
          />
        </PromptInput>

        {/* Controls row below input */}
        <div className="flex items-center gap-2 mt-2 w-full max-w-2xl mx-auto">
          {/* Mode toggle */}
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleMode}
            className={cn(
              "h-7 px-3 rounded-full border transition-colors",
              mode === "build"
                ? "bg-primary text-primary-foreground border-primary hover:bg-primary/90"
                : "border-border text-muted-foreground hover:bg-accent"
            )}
          >
            <span className="text-xs capitalize">{mode}</span>
          </Button>

          {/* Actions dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-7 px-2 rounded-full border border-border text-muted-foreground hover:bg-accent"
              >
                Actions
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              <DropdownMenuItem onSelect={() => setSetupModalOpen(true)}>
                Project Setup
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={() => setFetchModalOpen(true)}>
                Fetch Latest
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <ProjectSetupModal
          open={setupModalOpen}
          onOpenChange={setSetupModalOpen}
          projectId={projectId}
        />
        <FetchLatestModal
          open={fetchModalOpen}
          onOpenChange={setFetchModalOpen}
          projectId={projectId}
        />
      </div>
    </div>
  );
}
