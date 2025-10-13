"use client";

import { useEffect, useState } from "react";
import { Bot, Brain, PenLine, User, Plus, Copy } from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { Card, Button, Avatar } from "@/shared/components/ui";
import { Assistant } from "@/shared/types/assistants";
import { aiController } from "@/shared/network/api/aiController";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { AssistantList } from "./AssistantList";
import { AIContent } from "@/shared/types";
import { assistantsController } from "@/shared/network/api/assistantsController";
import ParticipantAvatar from "@/shared/components/transcription/participantAvatar";

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
  const [selectedChatIdx, setSelectedChatIdx] = useState<number | null>(null);
  const [showAssistantList, setShowAssistantList] = useState(true);

  const onAssistantClicked = (assistant: Assistant) => {
    setShowAssistantList(false);

    setUsedAssistants((prev) => {
      if (prev.some((a) => a.id === assistant.id)) {
        setSelectedChatIdx(prev.findIndex((a) => a.id === assistant.id));
        return prev;
      }
      setSelectedChatIdx(0);
      return [assistant, ...prev];
    });

    setIsFetching(true);
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
          console.error("Stream error:", err);
        }
      },
    });

    return () => {
      cancel = true;
      controller.abort();
    };
  };

  const onChatHistoryClicked = (idx: number) => {
    setShowAssistantList(false);
    setSelectedChatIdx(idx);
    const assistant = usedAssistants[idx];
    if (!assistant) return;
    setIsFetching(true);
    const content =
      aiContents.find((content) => content.assistant?.id === assistant.id)
        ?.content || [];
    setMessages(Array.isArray(content) ? content : [content]);
    setIsFetching(false);
  };

  const onNewChat = () => {
    setShowAssistantList(true);
    setSelectedChatIdx(null);
    setMessages([]);
  };

  const handleCopyMessages = () => {
    const text = messages.join("");
    if (!text) return;
    navigator.clipboard
      .writeText(text)
      .then(() => toast.success("Copied to clipboard!"))
      .catch(() => toast.error("Failed to copy."));
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

    fetchAssistants();
  }, [aiContents, meetId, meetingId]);

  return (
    <div className="flex w-full h-screen bg-background overflow-hidden border-t">
      {/* Left Sidebar: Chat History */}
      <div className="w-64 bg-muted/50 border-r flex flex-col">
        <div className="flex items-center justify-between p-4 border-b">
          <span className="font-semibold text-base flex items-center">
            <Bot className="mr-2 h-4 w-4" />
            History
          </span>
          <Button
            size="sm"
            variant="outline"
            onClick={onNewChat}
            className="flex items-center gap-2 px-3 py-1 rounded-md text-sm font-medium">
            <Plus className="h-4 w-4 mr-1" />
            New Chat
          </Button>
        </div>
        <div className="flex-1 overflow-y-auto p-2">
          {usedAssistants.length === 0 ? (
            <div className="text-muted-foreground text-center mt-8">
              No chats yet
            </div>
          ) : (
            <ul>
              {usedAssistants.map((assistant, idx) => (
                <li
                  key={assistant.id}
                  className={`flex items-center gap-2 px-4 py-3 cursor-pointer rounded-lg transition-colors ${selectedChatIdx === idx ? "bg-muted font-semibold" : "hover:bg-muted/60"}`}
                  onClick={() => onChatHistoryClicked(idx)}>
                  {assistant.icon}
                  <span className="truncate">{assistant.name}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* Right Panel: Chat or AssistantList */}
      <div className="flex-1 flex flex-col h-full p-8">
        {showAssistantList ? (
          <div className="flex-1 flex flex-col items-center">
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
        ) : selectedChatIdx !== null && usedAssistants[selectedChatIdx] ? (
          <div className="flex-1 flex flex-col items-center justify-start p-6">
            <Card className="flex flex-col w-full max-w-3xl mx-auto p-4 gap-8 shadow-none border-0 pt-8">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-start justify-end">
                <div className="px-4 py-2 rounded-2xl text-sm max-w-[75%] bg-primary text-white rounded-br-none">
                  {usedAssistants[selectedChatIdx]?.instructions}
                </div>
                <div className="rounded-lg bg-muted ml-2 flex items-center justify-center min-w-[2.5rem] min-h-[2.5rem]">
                  <User className="h-4 w-4 text-primary" />
                </div>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-start justify-start">
                <div className="rounded-lg bg-muted mr-2 flex items-center justify-center min-w-[2.5rem] min-h-[2.5rem]">
                  {isFetching ? (
                    <Brain className="h-4 w-4 text-primary animate-pulse" />
                  ) : isStreaming ? (
                    <PenLine className="h-4 w-4 text-primary animate-pulse" />
                  ) : (
                    <Bot className="h-4 w-4 text-primary" />
                  )}
                </div>
                {isFetching == false && (
                  <div className="relative w-[80%]">
                    <div className="overflow-y-auto scrollbar-gutter-stable prose prose-slate max-w-none bg-muted text-foreground p-4 rounded-xl prose-p:my-1 prose-li:my-0 prose-ul:my-1 prose-ol:my-1 leading-relaxed">
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>
                        {messages.join("")}
                      </ReactMarkdown>
                    </div>
                    {isFetching == false && isStreaming == false && (
                      <button
                        className="cursor-pointer mt-2 p-2 rounded hover:bg-muted/80 transition-colors"
                        onClick={handleCopyMessages}
                        title="Copy to clipboard"
                        type="button">
                        <Copy className="h-4 w-4 text-muted-foreground" />
                      </button>
                    )}
                  </div>
                )}
              </motion.div>
            </Card>
          </div>
        ) : null}
      </div>
    </div>
  );
}
