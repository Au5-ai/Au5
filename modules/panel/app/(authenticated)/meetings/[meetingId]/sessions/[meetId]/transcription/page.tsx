"use client";
import React, { useState, useEffect, useMemo } from "react";
import { useParams } from "next/navigation";
import { AIContent, Meeting } from "@/shared/types";
import { meetingsController } from "@/shared/network/api/meetingsController";
import NoRecordsState from "@/shared/components/empty-states/no-record";
import { LoadingPage } from "@/shared/components/loading-page";
import {
  Badge,
  Separator,
  SidebarInset,
  SidebarTrigger,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/shared/components/ui";
import { GLOBAL_CAPTIONS } from "@/shared/i18n/captions";
import BreadcrumbLayout from "@/shared/components/breadcrumb-layout";
import { NavActions } from "@/app/(authenticated)/meetings/[meetingId]/sessions/[meetId]/navActions";
import TranscriptionHeader from "@/shared/components/transcription/transcriptionHeader";
import TranscriptionFilters from "@/shared/components/transcription/transcriptionFilters";
import TranscriptionEntry from "@/shared/components/transcription/transcriptionEntry";
import { NoSearchResults } from "@/shared/components/empty-states/no-search-result";
import {
  Bot,
  Brain,
  CaptionsIcon,
  ChartPie,
  MessageCircleCode,
} from "lucide-react";
import { assistantsController } from "@/shared/network/api/assistantsController";
import { Assistant } from "@/shared/types/assistants";
import { AssistantList } from "../AssistantList";
import AIConversation from "../aiConversation";

export default function TranscriptionPage() {
  const [assistants, setAssistants] = useState<Assistant[]>([]);
  const [usedAssistants, setUsedAssistants] = useState<Assistant[]>([]);
  const [aiContents, setAIContents] = useState<AIContent[]>([]);
  const [selectedTab, setSelectedTab] = useState("Transcription");
  const [transcription, setTranscription] = useState<Meeting>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [selectedSpeaker, setSelectedSpeaker] = useState("");
  const [tab, setTab] = useState("home");

  const params = useParams();
  const meetingId = params.meetingId as string;
  const meetId = params.meetId as string;

  useEffect(() => {
    const fetchAssistants = async () => {
      const assistants = await assistantsController.getActive(true);
      setAssistants(assistants);
    };

    const fetchAIContents = async () => {
      const aiContents = await meetingsController.getAIContents(
        meetingId,
        meetId,
      );

      if (aiContents) {
        setAIContents(aiContents);
        if (Array.isArray(aiContents)) {
          const assistantsFromContents = aiContents
            .map((content) => content.assistant)
            .filter((assistant): assistant is Assistant => !!assistant);
          setUsedAssistants(assistantsFromContents);
        }
      }
    };
    const loadTranscription = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await meetingsController.getTranscription(
          meetingId,
          meetId,
        );
        setTranscription(data);
      } catch (error) {
        console.error("Failed to load transcription:", error);
        setError("Failed to load transcription data. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    if (meetingId && meetId) {
      fetchAssistants();
      fetchAIContents();
      loadTranscription();
    }
  }, [meetingId, meetId]);

  const onAssistantClicked = (assistant: Assistant) => {
    setUsedAssistants((prev) => {
      if (prev.some((a) => a.id === assistant.id)) {
        return prev;
      }

      return [...prev, assistant];
    });
    setSelectedTab(assistant.id);
  };

  const speakers: string[] = useMemo(() => {
    if (!transcription?.entries) return [];
    const uniqueParticipants = new Set<string>();
    transcription.entries.forEach((entry) => {
      if (entry?.fullName) {
        uniqueParticipants.add(entry.fullName);
      }
    });

    return Array.from(uniqueParticipants).sort();
  }, [transcription]);

  const filteredEntries = useMemo(() => {
    if (!transcription?.entries) return [];
    let filtered = transcription.entries;
    if (filterType !== "all") {
      const targetType =
        filterType === "transcription" ? "Transcription" : "Chat";
      filtered = filtered.filter((entry) => entry.entryType === targetType);
    }

    if (selectedSpeaker && selectedSpeaker !== "all") {
      filtered = filtered.filter(
        (entry) => entry?.fullName === selectedSpeaker,
      );
    }

    if (searchQuery) {
      filtered = filtered.filter(
        (entry) =>
          entry.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
          entry?.fullName.toLowerCase().includes(searchQuery.toLowerCase()),
      );
    }

    return filtered;
  }, [transcription, filterType, selectedSpeaker, searchQuery]);

  if (loading) {
    return (
      <LoadingPage
        text={GLOBAL_CAPTIONS.loadingTranscription}
        className="min-h-screen"
      />
    );
  }

  if (error) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center">
        <div className="text-center">
          <NoRecordsState
            title="Error loading transcription"
            description={error}
          />
        </div>
      </div>
    );
  }

  if (!transcription) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center">
        <div className="text-center">
          <NoRecordsState
            title="No transcriptions found."
            description="Select a different meeting or upload a new transcription."
          />
        </div>
      </div>
    );
  }

  return (
    <>
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator
              orientation="vertical"
              className="mr-2 data-[orientation=vertical]:h-4"
            />
            <BreadcrumbLayout />
          </div>
          <div className="ml-auto px-4">
            <NavActions
              meetingId={transcription?.id}
              meetId={transcription?.meetingId}
              isFavorite={transcription?.isFavorite}
            />
          </div>
        </header>
        <div className="min-h-screen w-full">
          <Tabs
            value={selectedTab}
            onValueChange={setSelectedTab}
            className="w-full">
            <div className="bg-muted px-4">
              <TabsList className="gap-4">
                <TabsTrigger value="Transcription">
                  <CaptionsIcon className="h-4 w-4" /> Transcription
                </TabsTrigger>
                {usedAssistants.map((assistant) => (
                  <TabsTrigger key={assistant.id} value={assistant.id}>
                    <div className="h-5 w-5">{assistant.icon}</div>{" "}
                    {assistant.name}
                  </TabsTrigger>
                ))}
                <TabsTrigger value="AINotes">
                  <MessageCircleCode className="h-4 w-4" /> AI meeting notes
                  <Badge className="h-5 min-w-5 rounded-full px-1 font-mono tabular-nums">
                    {usedAssistants.length}
                  </Badge>
                </TabsTrigger>
              </TabsList>
            </div>
            <TabsContent value="Transcription">
              <TranscriptionHeader meeting={transcription} />
              <TranscriptionFilters
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                filterType={filterType}
                setFilterType={setFilterType}
                selectedSpeaker={selectedSpeaker}
                setSelectedSpeaker={setSelectedSpeaker}
                speakers={speakers}
              />
              <div className="">
                <div className="flex">
                  <div className="flex-[2] bg-white overflow-hidden divide-y divide-gray-100">
                    {filteredEntries.length > 0 ? (
                      filteredEntries.map((entry, index) => (
                        <TranscriptionEntry
                          key={entry.blockId}
                          entry={entry}
                          index={index}
                        />
                      ))
                    ) : (
                      <NoSearchResults />
                    )}
                  </div>
                  <div className="flex-[1] bg-slate-50/50 border-gray-100 border-l">
                    <div className="flex h-[calc(100vh-72px)] w-full sticky top-[72px]">
                      <main className="flex-1 p-4">
                        <Tabs value={tab}>
                          <TabsContent value="home">
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
                          </TabsContent>
                        </Tabs>
                      </main>
                      <aside className="w-[48px] border-l bg-gray-50 flex flex-col items-center">
                        <Tabs
                          value={tab}
                          onValueChange={setTab}
                          orientation="vertical"
                          className="flex flex-col items-center pt-8">
                          <TabsList className="flex flex-col bg-transparent space-y-4">
                            <TabsTrigger
                              value="home"
                              className="p-2 hover:bg-accent transition-colors mt-4">
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <span>
                                    <Brain className="h-5 w-5" />
                                  </span>
                                </TooltipTrigger>
                                <TooltipContent>
                                  {GLOBAL_CAPTIONS.pages.meetings.aiAssistants}
                                </TooltipContent>
                              </Tooltip>
                            </TabsTrigger>

                            <TabsTrigger
                              value="statistics"
                              className="hover:bg-accent transition-colors mb-4 p-2">
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <span>
                                    <ChartPie className="h-5 w-5" />
                                  </span>
                                </TooltipTrigger>
                                <TooltipContent>
                                  {
                                    GLOBAL_CAPTIONS.pages.meetings
                                      .speakerSttistics
                                  }
                                </TooltipContent>
                              </Tooltip>
                            </TabsTrigger>
                          </TabsList>
                        </Tabs>
                      </aside>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>
            {usedAssistants.map((assistant) => (
              <TabsContent key={assistant.id} value={assistant.id}>
                <AIConversation
                  assistant={assistant}
                  meetId={meetId}
                  meetingId={meetingId}
                />
              </TabsContent>
            ))}
            {/* <TabsContent value="AINotes">AI Notes is here :)</TabsContent> */}
          </Tabs>
        </div>
      </SidebarInset>
    </>
  );
}
