"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { toast } from "sonner";
import {
  Bot,
  Brain,
  PenLine,
  User,
  Plus,
  Copy,
  Trash2Icon,
} from "lucide-react";
import {
  Card,
  Button,
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/shared/components/ui";
import { aiController } from "@/shared/network/api/aiController";
import { assistantsController } from "@/shared/network/api/assistantsController";
import { CopyToClipboard, truncateFirstLine } from "@/shared/lib";
import { GLOBAL_CAPTIONS } from "@/shared/i18n/captions";
import { Assistant } from "@/shared/types/assistants";
import { AIContent } from "@/shared/types";
import { AIAssistantList } from "./ai-assistant-list";
import { DeleteAIContentConfirmationModal } from "./delete-ai-content-confirmation-modal";

interface AIConversationProps {
  aiContents: AIContent[];
  meetId: string;
  meetingId: string;
  onNewContent?: (content: AIContent) => void;
  onContentDeleted?: (contentId: string) => void;
}

export default function AIConversation({
  aiContents,
  meetId,
  meetingId,
  onContentDeleted,
}: AIConversationProps) {
  const [usedAssistants, setUsedAssistants] = useState<Assistant[]>([]);
  const [assistants, setAssistants] = useState<Assistant[]>([]);
  const [messages, setMessages] = useState<string[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [isFetching, setIsFetching] = useState(false);
  const [selectedChatIdx, setSelectedChatIdx] = useState<number | null>(null);
  const [showAssistantList, setShowAssistantList] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const messagesRef = useRef<string[]>([]);

  useEffect(() => {
    if (Array.isArray(aiContents)) {
      const assistantsFromContents = aiContents
        .map((content) => content.assistant)
        .filter((assistant): assistant is Assistant => !!assistant);
      setUsedAssistants(assistantsFromContents);
    }

    const fetchAssistants = async () => {
      const activeAssistants = await assistantsController.getActive(true);
      setAssistants(activeAssistants);
    };

    fetchAssistants();
  }, [aiContents, meetId, meetingId]);

  useEffect(() => {
    messagesRef.current = messages;
  }, [messages]);

  const onAssistantClicked = (assistant: Assistant) => {
    setShowAssistantList(false);

    setUsedAssistants((prev) => {
      if (prev.some((a) => a.id === assistant.id)) {
        setSelectedChatIdx(prev.findIndex((a) => a.id === assistant.id));
        return prev;
      }

      aiContents.unshift({
        assistant,
        content: "is generating...",
        meetingId,
        id: "0",
        createdAt: "now",
      });

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
        const newContent: AIContent = {
          assistant,
          content: messagesRef.current.join(""),
          meetingId,
          id: "0",
          createdAt: "now",
        };
        aiContents[0] = newContent;
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
      aiContents.find((item) => item.assistant?.id === assistant.id)?.content ||
      [];
    setMessages(Array.isArray(content) ? content : [content]);
    setIsFetching(false);
  };

  const onNewChat = () => {
    setShowAssistantList(true);
    setSelectedChatIdx(null);
    setMessages([]);
  };

  const handleDeleteClick = () => {
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    if (selectedChatIdx === null) return;

    const currentContent = aiContents[selectedChatIdx];
    if (!currentContent?.id) return;

    try {
      setIsDeleting(true);
      await aiController.delete(meetingId, meetId, currentContent.id);
      toast.success(GLOBAL_CAPTIONS.pages.meetings.deleteAIContentSuccess);
      setShowDeleteModal(false);
      setShowAssistantList(true);
      setSelectedChatIdx(null);
      setMessages([]);

      if (onContentDeleted) {
        onContentDeleted(currentContent.id);
      }
    } catch (error) {
      console.error("Failed to delete AI content:", error);
      toast.error(GLOBAL_CAPTIONS.pages.meetings.deleteAIContentError);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="flex w-full h-full border-t">
      <div className="w-80 border-r flex flex-col sticky top-[48px] z-10 h-[calc(100vh-48px)]">
        <div className="flex items-center justify-between p-4 border-b">
          <Button
            size="sm"
            variant="outline"
            onClick={onNewChat}
            className="flex w-full items-center gap-2 px-3 py-1 rounded-md text-sm font-medium">
            <Plus className="h-4 w-4 mr-1" />
            New Chat
          </Button>
        </div>
        <div className="flex-1 overflow-y-auto p-3">
          <span className="text-sm text-gray">Chats</span>
          {aiContents.length === 0 ? (
            <div className="text-muted-foreground text-center mt-8">
              No chats yet
            </div>
          ) : (
            <ul>
              {aiContents.map((ai, idx) => (
                <li
                  key={ai.id}
                  className={`flex gap-2 items-start mt-2 px-2 py-2 cursor-pointer rounded-lg transition-colors ${
                    selectedChatIdx === idx
                      ? "bg-muted font-semibold"
                      : "hover:bg-muted/60"
                  }`}
                  onClick={() => onChatHistoryClicked(idx)}>
                  <span>{ai.assistant.icon}</span>
                  <div className="flex flex-col ml-auto items-start w-full">
                    <span className="truncate font-medium text-foreground text-sm">
                      {ai.assistant.name}
                    </span>
                    <span className="mt-1 line-clamp-2 text-foreground-muted text-xs">
                      {truncateFirstLine(ai.content, 60)}
                    </span>
                    <span className="mt-2 text-foreground-muted text-xs">
                      {ai.createdAt}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <div className="flex-1 flex flex-col h-full">
        {showAssistantList ? (
          <div className="flex-1 flex flex-col items-center pt-8">
            <AIAssistantList
              usedAssistants={usedAssistants}
              assistants={assistants}
              onClick={onAssistantClicked}
            />
          </div>
        ) : selectedChatIdx !== null && usedAssistants[selectedChatIdx] ? (
          <>
            <div className="flex items-center justify-between w-full mb-4 p-4 bg-white sticky top-[48px] z-10">
              <span className="ml-2 font-semibold text-lg">
                {usedAssistants[selectedChatIdx].icon}{" "}
                {usedAssistants[selectedChatIdx].name}
              </span>
              <div>
                <div className="flex gap-2">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={handleDeleteClick}
                          disabled={
                            aiContents[selectedChatIdx]?.id === "0" ||
                            !aiContents[selectedChatIdx]?.id
                          }>
                          <Trash2Icon className="h-4 w-4 text-destructive" />
                        </Button>
                      </span>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>
                        {aiContents[selectedChatIdx]?.id === "0" ||
                        !aiContents[selectedChatIdx]?.id
                          ? "Please reload the page to delete this content"
                          : "Delete AI content"}
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </div>
              </div>
            </div>

            <div className="flex-1 flex flex-col items-center justify-start p-6">
              <Card className="flex flex-col w-full max-w-3xl mx-auto p-4 gap-8 shadow-none border-0">
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
                  {isFetching === false && (
                    <div className="relative w-[80%]">
                      <div className="overflow-y-auto scrollbar-gutter-stable prose prose-slate max-w-none bg-muted text-foreground p-4 rounded-xl prose-p:my-1 prose-li:my-0 prose-ul:my-1 prose-ol:my-1 leading-relaxed">
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                          {messages.join("")}
                        </ReactMarkdown>
                      </div>
                      {isStreaming === false && (
                        <button
                          className="cursor-pointer mt-2 p-2 rounded hover:bg-muted/80 transition-colors"
                          onClick={() => CopyToClipboard(messages.join(""))}
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
          </>
        ) : null}
      </div>

      <DeleteAIContentConfirmationModal
        open={showDeleteModal}
        onOpenChange={setShowDeleteModal}
        onConfirm={handleDeleteConfirm}
        isLoading={isDeleting}
      />
    </div>
  );
}
