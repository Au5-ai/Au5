"use client";
import React, { useState, useEffect, useMemo } from "react";
import { useParams } from "next/navigation";
import { Meeting } from "@/shared/types";
import { meetingApi } from "@/shared/network/api/meeting";
import NoRecordsState from "@/shared/components/empty-states/no-record";
import { LoadingPage } from "@/shared/components/loading-page";
import {
  Separator,
  SidebarInset,
  SidebarTrigger,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/shared/components/ui";
import { GLOBAL_CAPTIONS } from "@/shared/i18n/captions";
import BreadcrumbLayout from "@/shared/components/breadcrumb-layout";
import { NavActions } from "@/shared/components/navActions";
import TranscriptionHeader from "@/shared/components/transcription/transcriptionHeader";
import TranscriptionFilters from "@/shared/components/transcription/transcriptionFilters";
import TranscriptionEntry from "@/shared/components/transcription/transcriptionEntry";
import { NoSearchResults } from "@/shared/components/empty-states/no-search-result";
import { BrainCog, CaptionsIcon, MessageCircleCode } from "lucide-react";
import { AiIcon } from "@/shared/components/ui/ai";
import { AssistantList } from "../AssistantList";
import { assistantsController } from "@/shared/network/api/assistantsController";
import { Assistant } from "@/shared/types/assistants";

export default function TranscriptionPage() {
  const [assistants, setAssistants] = useState<Assistant[]>([]);

  useEffect(() => {
    assistantsController.getActive(true).then(setAssistants);
  }, []);
  const [transcription, setTranscription] = useState<Meeting>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [selectedSpeaker, setSelectedSpeaker] = useState("");

  const params = useParams();
  const meetingId = params.meetingId as string;
  const meetId = params.meetId as string;

  useEffect(() => {
    const loadTranscription = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await meetingApi.getTranscription(meetingId, meetId);
        setTranscription(data);
      } catch (error) {
        console.error("Failed to load transcription:", error);
        setError("Failed to load transcription data. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    if (meetingId && meetId) {
      loadTranscription();
    }
  }, [meetingId, meetId]);

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
            <NavActions />
          </div>
        </header>
        <div className="min-h-screen w-full">
          <Tabs defaultValue="Transcription" className="w-full">
            <div className="bg-muted px-4">
              <TabsList>
                <TabsTrigger value="Transcription">
                  <CaptionsIcon className="mr-1 h-4 w-4" /> Transcription
                </TabsTrigger>
                <TabsTrigger value="DetailedSummary">
                  <AiIcon className="mr-1 h-4 w-4" /> Detailed AI Summary
                </TabsTrigger>
                <TabsTrigger value="GenerateActionItems">
                  <AiIcon className="mr-1 h-4 w-4" /> Generate Action Items
                </TabsTrigger>
                <TabsTrigger value="AINotes">
                  <MessageCircleCode className="mr-1 h-4 w-4" /> AI meeting
                  notes
                  <div className="flex items-center gap-1 bg-gray-500 text-white px-2 rounded-lg">
                    3
                  </div>
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
                {filteredEntries.length > 0 ? (
                  <>
                    <div className="flex">
                      <div className="flex-[2] bg-white overflow-hidden divide-y divide-gray-100">
                        {filteredEntries.map((entry, index) => (
                          <TranscriptionEntry
                            key={entry.blockId}
                            entry={entry}
                            index={index}
                          />
                        ))}
                      </div>

                      <div className="flex-[1] px-4 py-4 bg-slate-50/50 border-gray-100 border-l">
                        <h2 className="text-lg font-semibold mb-4 flex items-center">
                          <BrainCog className="mr-1 h-4 w-4" />
                          <span>AI Assistants</span>
                        </h2>

                        <AssistantList assistants={assistants} />
                      </div>
                    </div>
                  </>
                ) : (
                  <NoSearchResults />
                )}
              </div>
            </TabsContent>
            <TabsContent value="DetailedSummary">
              Detailed Summary is here :)
            </TabsContent>
            <TabsContent value="GenerateActionItems">
              Generate Action Items is here :)
            </TabsContent>
            <TabsContent value="AINotes">AI Notes is here :)</TabsContent>
          </Tabs>
        </div>
      </SidebarInset>
    </>
  );
}
