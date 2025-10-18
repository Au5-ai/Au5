"use client";
import React, { useState, useEffect, useMemo } from "react";
import { useParams } from "next/navigation";
import { AIContent, Meeting } from "@/shared/types";
import { meetingsController } from "@/shared/network/api/meetingsController";
import NoRecordsState from "@/shared/components/empty-states/no-record";
import { LoadingPage } from "@/shared/components/loading-page";
import {
  Badge,
  SidebarSeparator,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/shared/components/ui";
import { GLOBAL_CAPTIONS } from "@/shared/i18n/captions";
import TranscriptionHeader from "@/shared/components/transcription/transcriptionHeader";
import TranscriptionFilters from "@/shared/components/transcription/transcriptionFilters";
import TranscriptionEntry from "@/shared/components/transcription/transcriptionEntry";
import { NoSearchResults } from "@/shared/components/empty-states/no-search-result";
import { Blocks, CaptionsIcon, Sparkles } from "lucide-react";
import AIConversation from "../aiConversation";
import ParticipantAvatar from "@/shared/components/transcription/participantAvatar";
import { format } from "date-fns";
import ParticipantAvatarGroup from "@/shared/components/transcription/participantAvatarGroup";
import { CollapsibleList } from "@/shared/components/collapsibleList";
import { MySpacesResponse, Space } from "@/shared/types/space";
import { useCurrentUserSpaces } from "@/shared/hooks/use-user";

export default function TranscriptionPage() {
  const [aiContents, setAIContents] = useState<AIContent[]>([]);
  const [selectedTab, setSelectedTab] = useState("Transcription");
  const [transcription, setTranscription] = useState<Meeting>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [selectedSpeaker, setSelectedSpeaker] = useState("");
  const [spaces, setSpaces] = useState<MySpacesResponse[] | undefined>([]);

  const params = useParams();
  const meetingId = params.meetingId as string;
  const meetId = params.meetId as string;
  const currentUserSpaces = useCurrentUserSpaces();
  useEffect(() => {
    setSpaces(currentUserSpaces.data);
  }, [currentUserSpaces.data]);

  useEffect(() => {
    const fetchAIContents = async () => {
      const aiContents = await meetingsController.getAIContents(
        meetingId,
        meetId,
      );

      if (aiContents) {
        setAIContents(aiContents);
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
      fetchAIContents();
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

  const recordingDate = function (transcription: Meeting) {
    return transcription.entries?.[0]?.timestamp
      ? new Date(transcription.entries[0].timestamp)
      : new Date(transcription.createdAt || Date.now());
  };

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
    <div className="min-h-screen w-full">
      <TranscriptionHeader meeting={transcription} />
      <Tabs
        value={selectedTab}
        onValueChange={setSelectedTab}
        className="w-full gap-0">
        <div className="bg-muted px-4 sticky top-0 z-20 h-12 flex items-center">
          <TabsList className="gap-4">
            <TabsTrigger value="Transcription">
              <CaptionsIcon className="h-4 w-4" /> Transcription
            </TabsTrigger>

            <TabsTrigger value="AIConversation">
              <Sparkles className="h-4 w-4" /> AI meeting notes
              <Badge className="h-5 min-w-5 rounded-full px-1 font-mono tabular-nums">
                {aiContents.length}
              </Badge>
            </TabsTrigger>
          </TabsList>
        </div>
        <TabsContent value="Transcription">
          <div className="flex">
            <div className="flex-[2] bg-white">
              <div className="sticky top-[48px] z-10 bg-white border-b border-gray-100">
                <TranscriptionFilters
                  searchQuery={searchQuery}
                  setSearchQuery={setSearchQuery}
                  filterType={filterType}
                  setFilterType={setFilterType}
                  selectedSpeaker={selectedSpeaker}
                  setSelectedSpeaker={setSelectedSpeaker}
                  speakers={speakers}
                />
              </div>
              <div className="divide-y divide-gray-100">
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
            </div>
            <div className="flex-[1] border-gray-100 border-l">
              <div className="flex h-[calc(100vh-48px)] w-full sticky top-[48px]">
                <main className="flex-1 p-4">
                  <div className="">
                    <div className="flex justify-between mb-6">
                      <span className="font-medium text-gray-900">
                        Participants
                      </span>

                      <ParticipantAvatarGroup
                        participants={transcription.participants}
                        guests={transcription.guests}
                        maxVisible={8}
                      />
                    </div>
                    <div className="flex items-center gap-3 text-sm text-gray-600 mb-6">
                      <ParticipantAvatar
                        fullName={transcription.userRecorder.fullName}
                        pictureUrl={transcription.userRecorder.pictureUrl}
                      />
                      <span className="flex flex-col">
                        <span>
                          Recorded by{" "}
                          <span className="font-medium text-gray-900">
                            {transcription.userRecorder.fullName}
                          </span>
                        </span>
                        <span>
                          {format(recordingDate(transcription), "dd MMMM yy")}{" "}
                          {format(recordingDate(transcription), "HH:mm")}
                        </span>
                      </span>
                    </div>
                    <SidebarSeparator className="mx-0 mt-4 mb-4" />
                    <CollapsibleList
                      defaultOpen={true}
                      row={{
                        icon: Blocks,
                        name: "Add to your spaces",
                        items: spaces?.map((space) => space.name) || [],
                      }}
                    />
                  </div>
                </main>
              </div>
            </div>
          </div>
        </TabsContent>
        <TabsContent value="AIConversation">
          <div className="sticky top-[48px] z-10 h-[calc(100vh-48px)]">
            <AIConversation
              onNewContent={(newContent) =>
                setAIContents((prev) => [...prev, newContent])
              }
              aiContents={aiContents}
              meetId={meetId}
              meetingId={meetingId}
            />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
