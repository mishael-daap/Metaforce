"use client";

import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { useRef, useEffect, useState } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import { Send, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import ReactMarkdown from "react-markdown";

interface OrgSession {
  alias: string;
  instanceUrl: string;
  accessToken: string;
}

function ChatInner({ session }: { session: OrgSession }) {
  const { messages, sendMessage, status } = useChat({
    transport: new DefaultChatTransport({
      api: "/api/chat",
      body: {
        alias: session.alias,
        instanceUrl: session.instanceUrl,
        accessToken: session.accessToken,
      },
    }),
  });

  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <div className="flex flex-col max-w-4xl max-h-[90vh] overflow-hidden gap-10">
      <ScrollArea
        ref={scrollRef}
        className={cn(
          "max-w-4xl max-h-[90vh] overflow-y-scroll px-10",
          "[&::-webkit-scrollbar]:w-2",
          "[&::-webkit-scrollbar-track]:bg-transparent",
          "[&::-webkit-scrollbar-thumb]:bg-border",
          "[&::-webkit-scrollbar-thumb]:rounded-full",
          "hover:[&::-webkit-scrollbar-thumb]:bg-muted-foreground/30",
          "[&::-webkit-scrollbar]:hidden",
        )}
      >
        <div className="space-y-10">
          {messages
            .filter((message) => {
              if (message.role === "assistant") {
                const textParts = message.parts.filter((p) => p.type === "text");
                return textParts.some((p) => p.text.length > 0);
              }
              return true;
            })
            .map((message) => (
              <div
                key={message.id}
                className={`flex items-start gap-3 ${message.role === "user" ? "flex-row-reverse" : ""}`}
              >
                <Avatar className="h-8 w-8">
                  <AvatarFallback>{message.role === "user" ? "U" : "AI"}</AvatarFallback>
                </Avatar>
                <div
                  className={`rounded-lg px-4 py-2 max-w-[80%] ${message.role === "user" ? "bg-muted" : ""}`}
                >
                  <div className="text-sm prose prose-sm dark:prose-invert max-w-none">
                    {message.parts.map((part, index) =>
                      part.type === "text" ? <ReactMarkdown key={index}>{part.text}</ReactMarkdown> : null,
                    )}
                  </div>
                </div>
              </div>
            ))}

          {(status === "submitted" || status === "streaming") && (
            <div className="flex items-start gap-3">
              <Avatar className="h-8 w-8">
                <AvatarFallback>AI</AvatarFallback>
              </Avatar>
              <div className="rounded-lg px-4 py-2 bg-muted">
                <div className="flex gap-1">
                  <span className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" />
                  <span className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce [animation-delay:0.2s]" />
                  <span className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce [animation-delay:0.4s]" />
                </div>
              </div>
            </div>
          )}
        </div>
      </ScrollArea>

      <div className="shrink-0 w-full lg:min-w-2xl">
        <div className="bg-background border border-border rounded-2xl overflow-hidden px-3 grow">
          <form
            className="flex flex-col"
            onSubmit={(e) => {
              e.preventDefault();
              if (input.trim()) {
                sendMessage({ text: input });
                setInput("");
              }
            }}
          >
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask anything"
              rows={1}
              onInput={(e) => {
                const target = e.target as HTMLTextAreaElement;
                target.style.height = "auto";
                target.style.height = target.scrollHeight + "px";
              }}
              className={cn(
                "w-full bg-transparent! py-3 px-0 border-0 shadow-none focus-visible:ring-0 focus-visible:ring-offset-0 text-foreground placeholder-muted-foreground resize-none border-none outline-none text-sm leading-normal min-h-10 max-h-[25vh]",
                "[&::-webkit-scrollbar]:w-2",
                "[&::-webkit-scrollbar-track]:bg-transparent",
                "[&::-webkit-scrollbar-thumb]:bg-border",
                "[&::-webkit-scrollbar-thumb]:rounded-full",
                "hover:[&::-webkit-scrollbar-thumb]:bg-muted-foreground/30",
              )}
            />
            <div className="flex items-center justify-between pb-2 pt-1">
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  className="size-8 p-0 rounded-full border border-border flex items-center justify-center"
                >
                  <Plus className="size-3" />
                </Button>
              </div>
              <div>
                <Button
                  type="submit"
                  disabled={!input.trim()}
                  className="size-8 p-0 rounded-full bg-primary disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  <Send className="size-4 text-primary-foreground" />
                </Button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export function Chat() {
  const [session, setSession] = useState<OrgSession | null>(null);

  useEffect(() => {
  const alias = sessionStorage.getItem("alias") ?? "";
  const instanceUrl = sessionStorage.getItem("instanceUrl") ?? "";
  const accessToken = sessionStorage.getItem("accessToken") ?? "";
  setTimeout(() => setSession({ alias, instanceUrl, accessToken }), 0);
}, []);

  // Don't render chat until session is loaded from sessionStorage
  if (!session) return null;

  // No org connected yet — show sign in prompt
  if (!session.alias || !session.instanceUrl || !session.accessToken) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-muted-foreground text-sm">Connect a Salesforce org to get started.</p>
      </div>
    );
  }

  return <ChatInner session={session} />;
}
