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
import { AppWindow, MessageCircle, File} from "lucide-react";
import {
  PromptInput,
  PromptInputTextarea,
  PromptInputSubmit,
} from "@/src/components/ai-elements/prompt-input";

import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable"
import { Requirement } from "@/src/types/requirements";

const mockRequirements: Requirement[] = [
  {
    id: '1',
    title: 'User Authentication',
    description:
      'Implement secure user authentication with JWT tokens and email verification. Users should be able to sign up, log in, and reset their passwords.',
    status: 'completed',
  },
  {
    id: '2',
    title: 'Database Integration',
    description:
      'Set up PostgreSQL database with proper schema, indexing, and migrations. Ensure data integrity with appropriate constraints.',
    status: 'completed',
  },
  {
    id: '3',
    title: 'API Documentation',
    description:
      'Create comprehensive API documentation using OpenAPI/Swagger. Include authentication details, endpoint specifications, and example requests.',
    status: 'planned',
  },
  {
    id: '4',
    title: 'Performance Optimization',
    description:
      'Optimize database queries, implement caching strategies, and reduce bundle size. Target achieving <2s initial load time.',
    status: 'pending',
  },
  {
    id: '5',
    title: 'Mobile Responsiveness',
    description:
      'Ensure the application is fully responsive on mobile devices (iOS and Android). Test on various screen sizes.',
    status: 'pending',
  },
  {
    id: '6',
    title: 'Legacy System Migration',
    description:
      'Migrate data from the old system to the new architecture. This requirement was superseded by the new architecture.',
    status: 'cancelled',
  }, {
    id: '1',
    title: 'User Authentication',
    description:
      'Implement secure user authentication with JWT tokens and email verification. Users should be able to sign up, log in, and reset their passwords.',
    status: 'completed',
  },
  {
    id: '2',
    title: 'Database Integration',
    description:
      'Set up PostgreSQL database with proper schema, indexing, and migrations. Ensure data integrity with appropriate constraints.',
    status: 'completed',
  },
  {
    id: '3',
    title: 'API Documentation',
    description:
      'Create comprehensive API documentation using OpenAPI/Swagger. Include authentication details, endpoint specifications, and example requests.',
    status: 'planned',
  },
  {
    id: '4',
    title: 'Performance Optimization',
    description:
      'Optimize database queries, implement caching strategies, and reduce bundle size. Target achieving <2s initial load time.',
    status: 'pending',
  },
  {
    id: '5',
    title: 'Mobile Responsiveness',
    description:
      'Ensure the application is fully responsive on mobile devices (iOS and Android). Test on various screen sizes.',
    status: 'pending',
  },
  {
    id: '6',
    title: 'Legacy System Migration',
    description:
      'Migrate data from the old system to the new architecture. This requirement was superseded by the new architecture.',
    status: 'cancelled',
  },
];


import { useImperativeHandle } from "react";
import { Button } from "@/components/ui/button";
import { RequirementsList } from "@/components/chat/requirements-list";

export function Page() {
  const [input, setInput] = useState("");
  const { messages, sendMessage, status } = useChat();
  const handleSubmit = (message: PromptInputMessage) => {
    if (message.text.trim()) {
      sendMessage({ text: message.text });
      setInput("");
    }
  };
  return (
    <div className="flex flex-col h-full">
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

export default function ResizableDemo() {
  const [showPanel, setShowPanel] = useState(false);
  return (
    // top bar
    <div className="h-screen flex flex-col p-4">
      <div className="flex justify-between">
        

        <div>.</div>

        <File  onClick={() => setShowPanel(p => !p)} className=""/>

      </div>
      <ResizablePanelGroup
      orientation="horizontal"
      className="w-screen"
    >
      <ResizablePanel defaultSize="60%">
        <Page />
      </ResizablePanel>

      <ResizableHandle  className="bg-transparent" withHandle/>

      {showPanel && (
  <ResizablePanel className="pt-4 pr-4 pb-4 animate-in slide-in-from-right">
    <div className="h-full overflow-y-auto rounded-lg border p-6">
      <RequirementsList requirements={mockRequirements} />
    </div>
  </ResizablePanel>
)}
    </ResizablePanelGroup>
    </div>
  )
}