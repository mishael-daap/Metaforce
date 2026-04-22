"use client";

import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { useRef, useEffect, useState } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import { Send } from "lucide-react";
import { Plus } from "lucide-react";
import { cn } from "@/lib/utils";

const dummyMessages = [
  {
    id: "1",
    role: "user" as const,
    content: "Hey, can you help me build a React component?",
    parts: [{ type: "text", text: "Hey, can you help me build a React component?" }],
  },
  {
    id: "2",
    role: "assistant" as const,
    content: "Of course! I'd love to help. What kind of component are we building?",
    parts: [{ type: "text", text: "Of course! I'd love to help. What kind of component are we building?" }],
  },
  {
    id: "3",
    role: "user" as const,
    content: "I need a chat interface with a nice scrollbar.",
    parts: [{ type: "text", text: "I need a chat interface with a nice scrollbar." }],
  },
  {
    id: "4",
    role: "assistant" as const,
    content: "Sounds good. For the scrollbar, are we talking about a custom CSS implementation or utilizing an external library?",
    parts: [{ type: "text", text: "Sounds good. For the scrollbar, are we talking about a custom CSS implementation or utilizing an external library?" }],
  },
  {
    id: "5",
    role: "user" as const,
    content: "Just custom Tailwind CSS classes. I want it to be thin and rounded.",
    parts: [{ type: "text", text: "Just custom Tailwind CSS classes. I want it to be thin and rounded." }],
  },
  {
    id: "6",
    role: "assistant" as const,
    content: "Perfect. Tailwind's arbitrary variants like `[&::-webkit-scrollbar]:w-2` are great for this. Have you set up the base layout yet?",
    parts: [{ type: "text", text: "Perfect. Tailwind's arbitrary variants like `[&::-webkit-scrollbar]:w-2` are great for this. Have you set up the base layout yet?" }],
  },
  {
    id: "7",
    role: "user" as const,
    content: "Yeah, I have a ScrollArea and a fixed input at the bottom. But the native scrollbar looks super clunky next to my sleek UI.",
    parts: [{ type: "text", text: "Yeah, I have a ScrollArea and a fixed input at the bottom. But the native scrollbar looks super clunky next to my sleek UI." }],
  },
  {
    id: "8",
    role: "assistant" as const,
    content: "Got it. We can apply the custom pseudo-elements directly to the ScrollArea or Textarea. You'll want to target the thumb and track specifically to get that rounded pill look.",
    parts: [{ type: "text", text: "Got it. We can apply the custom pseudo-elements directly to the ScrollArea or Textarea. You'll want to target the thumb and track specifically to get that rounded pill look." }],
  },
  {
    id: "9",
    role: "user" as const,
    content: "Awesome, that worked! One more thing, how do I make the chat auto-scroll to the bottom when a new message arrives?",
    parts: [{ type: "text", text: "Awesome, that worked! One more thing, how do I make the chat auto-scroll to the bottom when a new message arrives?" }],
  },
  {
    id: "10",
    role: "assistant" as const,
    content: "You can use a `useRef` attached to the scroll container and a `useEffect` that triggers whenever the `messages` array changes. Inside the effect, just set `scrollTop = scrollHeight`.",
    parts: [{ type: "text", text: "You can use a `useRef` attached to the scroll container and a `useEffect` that triggers whenever the `messages` array changes. Inside the effect, just set `scrollTop = scrollHeight`." }],
  },
  {
    id: "11",
    role: "user" as const,
    content: "Oh right, that makes total sense. I will wire up the ref right now and test the scrolling behavior.",
    parts: [{ type: "text", text: "Oh right, that makes total sense. I will wire up the ref right now and test the scrolling behavior." }],
  },
  {
    id: "12",
    role: "assistant" as const,
    content: "Great! Let me know if you run into any issues with the scroll behavior, especially making sure it stays pinned to the bottom when the AI is actively streaming its response.",
    parts: [{ type: "text", text: "Great! Let me know if you run into any issues with the scroll behavior, especially making sure it stays pinned to the bottom when the AI is actively streaming its response." }],
  },
];

export function Chat() {
  const { messages, sendMessage, status } = useChat({
    transport: new DefaultChatTransport({
      api: "/api/chat",
    }),

  });

  // const messages = dummyMessages

  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <div className="flex flex-col max-w-4xl max-h-[90vh] overflow-hidden gap-10">
      <ScrollArea ref={scrollRef} className={cn(
              //  "w-2/3 border h-[90vh] overflow-y-scroll",
              "max-w-4xl max-h-[90vh] overflow-y-scroll px-10",
                "[&::-webkit-scrollbar]:w-2",
                "[&::-webkit-scrollbar-track]:bg-transparent",
                "[&::-webkit-scrollbar-thumb]:bg-border",
                "[&::-webkit-scrollbar-thumb]:rounded-full",
                "hover:[&::-webkit-scrollbar-thumb]:bg-muted-foreground/30",
                "[&::-webkit-scrollbar]:hidden",
              )}>
        <div className="space-y-10">
          {messages.filter((message) => {
            // Filter out empty assistant messages (shown as loading state)
            if (message.role === "assistant") {
              const textParts = message.parts.filter(p => p.type === "text");
              return textParts.some(p => p.text.length > 0);
            }
            return true;
          }).map((message) => (
            <div
              key={message.id}
              className={`flex items-start gap-3 ${
                message.role === "user" ? "flex-row-reverse" : ""
              }`}
            >
              <Avatar className="h-8 w-8">
                <AvatarFallback>
                  {message.role === "user" ? "U" : "AI"}
                </AvatarFallback>
              </Avatar>
              <div
                className={`rounded-lg px-4 py-2 max-w-[80%] ${
                  message.role === "user"
                    ? "bg-muted"
                    : ""
                }`}
              >
                <p className="text-sm whitespace-pre-wrap">
                  {message.parts.map((part, index) =>
                    part.type === "text" ? (
                      <span key={index}>{part.text}</span>
                    ) : null,
                  )}
                </p>
              </div>
            </div>
          ))}

          {(status === "submitted" || status === "streaming")&& (
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

      <div className="shrink-0 w-2xl">
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
                // Custom Scrollbar Styling
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
                  <Plus className="size-4" />
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
