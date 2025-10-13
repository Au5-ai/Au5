"use client";

import { useEffect, useState } from "react";
import { Bot, Brain, PenLine, User } from "lucide-react";
import { motion } from "framer-motion";
import { Card } from "@/shared/components/ui";
import { Assistant } from "@/shared/types/assistants";
import { aiController } from "@/shared/network/api/aiController";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface AIConversationProps {
  assistant: Assistant;
  meetId: string;
  meetingId: string;
}

export default function AIConversation({
  assistant,
  meetId,
  meetingId,
}: AIConversationProps) {
  const [messages, setMessages] = useState<string[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [isFetching, setIsFetching] = useState(false);

  useEffect(() => {
    let cancel = false;
    const controller = new AbortController();
    setMessages([]);
    setIsFetching(true);
    setIsStreaming(false);

    aiController.generate({
      meetingId,
      meetId,
      assistantId: assistant.id,
      signal: controller.signal,
      onStart: () => {
        setIsStreaming(true);
      },
      onDelta: (text) => {
        setIsFetching(false);
        setMessages((prev) => [...prev, text]);
      },
      onEnd: () => {
        setIsStreaming(false);
      },
      onError: (err) => {
        if (!cancel) {
          setIsStreaming(false);
          setIsFetching(false);
          // Show error and retry option
          console.error("Stream error:", err);
        }
      },
    });

    return () => {
      cancel = true;
      controller.abort();
    };
  }, [assistant.id, meetId, meetingId]);

  return (
    <Card className="flex flex-col w-full max-w-3xl mx-auto p-4 gap-8 shadow-none border-0 pt-8">
      {/* User message */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-start justify-end">
        <div className="px-4 py-2 rounded-2xl text-sm max-w-[75%] bg-primary text-white rounded-br-none">
          {assistant.instructions}
        </div>
        <div className="p-2 rounded-full bg-primary/10 ml-2">
          <User className="h-4 w-4 text-primary" />
        </div>
      </motion.div>

      {/* AI streaming response */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-start justify-start">
        <div className="p-2 rounded-full bg-muted mr-2 flex items-center justify-center min-w-[2.5rem] min-h-[2.5rem]">
          {isFetching ? (
            <Brain className="h-4 w-4 text-primary animate-pulse" />
          ) : isStreaming ? (
            <PenLine className="h-4 w-4 text-primary animate-pulse" />
          ) : (
            <Bot className="h-4 w-4 text-primary" />
          )}
        </div>

        {isFetching == false && (
          <div className="overflow-y-auto scrollbar-gutter-stable prose prose-slate max-w-none w-[80%] bg-muted text-foreground rounded-bl-none p-4 rounded-xl prose-p:my-1 prose-li:my-0 prose-ul:my-1 prose-ol:my-1 leading-relaxed">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {messages.join("")}
            </ReactMarkdown>
          </div>
        )}
      </motion.div>
    </Card>
  );
}
