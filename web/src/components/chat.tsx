"use client";

import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { useRef, useEffect, useState } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import { Send, Plus, ListChecks, Rocket } from "lucide-react";
import { cn } from "@/lib/utils";
import ReactMarkdown from "react-markdown";
import { usePlanMode } from "@/hooks/use-plan-mode";
import { PlanComponent } from "@/components/plan/PlanComponent";
import { ExecutionPlan } from "@/lib/schemas/plan-schemas";

interface OrgSession {
  alias: string;
  instanceUrl: string;
  accessToken: string;
}

function ChatInner({ session }: { session: OrgSession }) {
  const { mode, toggleMode, isPlanMode } = usePlanMode();
  const { messages, sendMessage, status } = useChat({
    transport: new DefaultChatTransport({
      api: "/api/chat",
      body: {
        alias: session.alias,
        instanceUrl: session.instanceUrl,
        accessToken: session.accessToken,
        mode,
      },
    }),
  });

  const [input, setInput] = useState("");
  const [currentPlan, setCurrentPlan] = useState<ExecutionPlan | null>(null);
  const [isApproved, setIsApproved] = useState(false);
  const [completedActions, setCompletedActions] = useState<string[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  // Extract plan from data-plan parts
  useEffect(() => {
    const lastMessage = messages[messages.length - 1];
    if (lastMessage?.role === 'assistant') {
      const planPart = lastMessage.parts.find(p => p.type === 'data-plan');
      if (planPart && 'data' in planPart && planPart.data) {
        setCurrentPlan(planPart.data as ExecutionPlan);
      }
    }
  }, [messages]);

  const handleApprovePlan = () => {
    setIsApproved(true);
    sendMessage({ text: 'PLAN_APPROVED' });
  };

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
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex items-start gap-3 ${message.role === "user" ? "flex-row-reverse" : ""}`}
            >
              <Avatar className="h-8 w-8">
                <AvatarFallback>{message.role === "user" ? "U" : "AI"}</AvatarFallback>
              </Avatar>
              <div className={`rounded-lg px-4 py-2 max-w-[80%] ${message.role === "user" ? "bg-muted" : ""}`}>
                <div className="text-sm prose prose-sm dark:prose-invert max-w-none space-y-2">
                  {/* Render data-plan parts */}
                  {message.parts
                    .filter((p) => p.type === 'data-plan')
                    .map((part, index) => (
                      <PlanComponent
                        key={index}
                        plan={(part as any).data as ExecutionPlan}
                        onApprove={handleApprovePlan}
                        isApproved={isApproved}
                        completedActions={completedActions}
                      />
                    ))}
                  {/* Render text parts */}
                  {message.parts
                    .filter((p) => p.type === 'text')
                    .map((part, index) => (
                      <ReactMarkdown key={index}>{part.text}</ReactMarkdown>
                    ))}
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
                <Button
                  type="button"
                  variant={isPlanMode ? "default" : "outline"}
                  className={cn(
                    "h-8 px-3 rounded-full text-xs font-medium transition-all",
                    isPlanMode ? "bg-primary text-primary-foreground" : "border border-border"
                  )}
                  onClick={toggleMode}
                  title={isPlanMode ? "Plan Mode" : "Execute Mode"}
                >
                  {isPlanMode ? <ListChecks className="size-3 mr-1" /> : <Rocket className="size-3 mr-1" />}
                  {isPlanMode ? "Plan" : "Execute"}
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
