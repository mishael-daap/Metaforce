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
import { getProjectRequirements, updateRequirement, deleteRequirement } from "./actions";
import { RequirementsList } from "@/components/chat/requirements-list";
import type { Requirement } from "@/src/types/requirements";
import { Button } from "@/components/ui/button";

// "max-w-4xl max-h-[90vh] overflow-y-scroll px-10",
//           "[&::-webkit-scrollbar]:w-2",
//           "[&::-webkit-scrollbar-track]:bg-transparent",
//           "[&::-webkit-scrollbar-thumb]:bg-border",
//           "[&::-webkit-scrollbar-thumb]:rounded-full",
//           "hover:[&::-webkit-scrollbar-thumb]:bg-muted-foreground/30",
//           "[&::-webkit-scrollbar]:hidden",

export function Chat({
  projectId,
  initialMessages,
  onFinish,         // <- no '?' here
  mode,
  setMode,
}: {
  projectId: string;
  initialMessages: UIMessage[];
  onFinish?: (messages: UIMessage[]) => void;  // '?' only in the type
  mode: 'plan' | 'build';
  setMode: React.Dispatch<React.SetStateAction<'plan' | 'build'>>;
}) {
  const [input, setInput] = useState("");

  const { messages, sendMessage, status } = useChat({
    id: projectId,
    messages: initialMessages,
    transport: new DefaultChatTransport({
      api: mode === 'build' ? "/api/projectbuild" : "/api/projectchat",
      prepareSendMessagesRequest({ messages, id }) {
        return {
          body: {
            messages,
            projectId: id,
          },
        };
      },
    }),
    onFinish: async ({ messages: finalMessages }) => {
      // Call the onFinish callback if provided
      if (onFinish) {
        onFinish(finalMessages);
      }
    },
  });

  const handleSubmit = (message: PromptInputMessage) => {
    if (message.text.trim()) {
      sendMessage({ text: message.text });
      setInput("");
    }
  };



  return (
    <div className="flex flex-col ">
      <Conversation className="flex-1 overflow-y-auto scrollbar-thin ">
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
  const [requirements, setRequirements] = useState<Requirement[]>([]);
  const [loading, setLoading] = useState(true);
  const [previousRequirementsHash, setPreviousRequirementsHash] = useState<string | null>(null);
  const [mode, setMode] = useState<'plan' | 'build'>('plan'); // Default to plan mode

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

    const fetchRequirements = async () => {
      setLoading(true);
      try {
        const reqs = await getProjectRequirements(projectId);
        setRequirements(reqs);
      } catch (err) {
        console.error("Failed to fetch requirements:", err);
        setRequirements([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProjectName();
    fetchRequirements();
  }, [projectId]);

  // Auto-open requirements panel when requirements change (but not on initial load)
  useEffect(() => {
    if (previousRequirementsHash !== null) {
      // Create a hash of current requirements
      const currentHash = requirements
        .map(req => `${req.id}-${req.title}-${req.description}-${req.status}`)
        .join('|');

      // If hash changed and there are requirements, open the panel
      if (currentHash !== previousRequirementsHash && requirements.length > 0) {
        setShowPanel(true);
      }

      // Update the previous hash
      setPreviousRequirementsHash(currentHash);
    } else {
      // Set initial hash on first load
      const initialHash = requirements
        .map(req => `${req.id}-${req.title}-${req.description}-${req.status}`)
        .join('|');
      setPreviousRequirementsHash(initialHash);
    }
  }, [requirements, previousRequirementsHash]);

  const handleUpdateRequirement = async (id: string, title: string, description: string) => {
    const result = await updateRequirement(id, title, description, projectId);
    if (result.success) {
      // Refresh requirements list
      const reqs = await getProjectRequirements(projectId);
      setRequirements(reqs);
    } else {
      console.error("Failed to update requirement:", result.error);
    }
  };

  const handleDeleteRequirement = async (id: string) => {
    const result = await deleteRequirement(id, projectId);
    if (result.success) {
      // Refresh requirements list
      const reqs = await getProjectRequirements(projectId);
      setRequirements(reqs);
    } else {
      console.error("Failed to delete requirement:", result.error);
    }
  };

  return (
    // top bar
    <div className="h-screen flex flex-col p-4 overflow-hidden">
      <div className="flex justify-between items-center">
        <div className="text-lg font-medium">{projectName}</div>
        <div className="flex items-center space-x-2">
          <Button
            variant={mode === 'plan' ? 'secondary' : 'default'}
            onClick={() => setMode('plan')}
            size="sm"
          >
            Plan Mode
          </Button>
          <Button
            variant={mode === 'build' ? 'secondary' : 'default'}
            onClick={() => setMode('build')}
            size="sm"
          >
            Build Mode
          </Button>
        </div>
      </div>

      <ResizablePanelGroup
        orientation="horizontal"
        className="w-screen"
      >
        <ResizablePanel defaultSize="60%">
          <Chat
            projectId={projectId}
            initialMessages={initialMessages}
            onFinish={(finalMessages) => {
              // Optionally fetch requirements after chat finishes to catch any AI-created requirements
              getProjectRequirements(projectId).then(newReqs => {
                setRequirements(newReqs);
              });
            }}
            mode={mode}
            setMode={setMode}
          />
        </ResizablePanel>

        <ResizableHandle  className="bg-transparent" withHandle/>

        {showPanel && <ResizablePanel className="pt-4 pr-4 pb-4 animate-in slide-in-from-right">
          <div className="h-full overflow-y-auto">
            {loading ? (
              <div className="flex h-full items-center justify-center">
                <span>Loading requirements...</span>
              </div>
            ) : (
             <>
              <div className="mb-4">
                <p className="text-sm text-muted-foreground">
                  Current mode: {mode === 'plan' ? 'Plan' : 'Build'}
                </p>
              </div>
              <RequirementsList
                requirements={requirements}
                onUpdate={handleUpdateRequirement}
                onDelete={handleDeleteRequirement}
              /></>
            )}
          </div>
        </ResizablePanel>}
      </ResizablePanelGroup>
    </div>
  );
}