"use client";

import { useEffect, useState } from "react";
import { Bot, Brain, PenLine, User } from "lucide-react";
import { motion } from "framer-motion";
import { Card } from "@/shared/components/ui";
import { Assistant } from "@/shared/types/assistants";
import { aiController } from "@/shared/network/api/aiController";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { AssistantList } from "./AssistantList";
import { AIContent } from "@/shared/types";
import { assistantsController } from "@/shared/network/api/assistantsController";

interface AIConversationProps {
  aiContents: AIContent[];
  meetId: string;
  meetingId: string;
}

export default function AIConversation({
  aiContents,
  meetId,
  meetingId,
}: AIConversationProps) {
  const [usedAssistants, setUsedAssistants] = useState<Assistant[]>([]);
  const [assistants, setAssistants] = useState<Assistant[]>([]);
  const [messages, setMessages] = useState<string[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [isFetching, setIsFetching] = useState(false);

  const onAssistantClicked = (assistant: Assistant) => {
    // setUsedAssistants((prev) => {
    //   if (prev.some((a) => a.id === assistant.id)) {
    //     return prev;
    //   }
    //   return [...prev, assistant];
    // });
    //setSelectedTab(assistant.id);
  };

  useEffect(() => {
    if (Array.isArray(aiContents)) {
      const assistantsFromContents = aiContents
        .map((content) => content.assistant)
        .filter((assistant): assistant is Assistant => !!assistant);
      setUsedAssistants(assistantsFromContents);
    }

    const fetchAssistants = async () => {
      const assistants = await assistantsController.getActive(true);
      setAssistants(assistants);
    };

    // let cancel = false;
    // const controller = new AbortController();
    // setMessages([]);
    // setIsFetching(true);
    // setIsStreaming(false);

    // aiController.generate({
    //   meetingId,
    //   meetId,
    //   assistantId: assistants[0].id,
    //   signal: controller.signal,
    //   onStart: () => {
    //     setIsStreaming(true);
    //   },
    //   onDelta: (text) => {
    //     setIsFetching(false);
    //     setMessages((prev) => [...prev, text]);
    //   },
    //   onEnd: () => {
    //     setIsStreaming(false);
    //   },
    //   onError: (err) => {
    //     if (!cancel) {
    //       setIsStreaming(false);
    //       setIsFetching(false);
    //       // Show error and retry option
    //       console.error("Stream error:", err);
    //     }
    //   },
    // });

    // return () => {
    //   cancel = true;
    //   controller.abort();
    // };

    fetchAssistants();
  }, [aiContents, meetId, meetingId]);

  return (
    <>
      <div className="max-w-4xl mx-auto">
        <h2 className="text-lg font-semibold mb-4 flex items-center">
          <Bot className="mr-1 h-4 w-4" />
          <span>AI Assistants</span>
        </h2>
        <AssistantList
          usedAssistants={usedAssistants}
          assistants={assistants}
          onClick={onAssistantClicked}
        />
      </div>
    </>
  );
}
