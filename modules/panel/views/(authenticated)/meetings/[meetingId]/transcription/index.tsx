"use client";

import React, { useState, useEffect, useMemo } from "react";
import { format } from "date-fns";
import { Blocks, CaptionsIcon, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { useParams } from "next/navigation";
import { LoadingPage } from "@/shared/components/loading-page";
import NoRecordsState from "@/shared/components/empty-states/no-record";
import { NoSearchResults } from "@/shared/components/empty-states/no-search-result";
import {
  Badge,
  SidebarSeparator,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/shared/components/ui";
import { GLOBAL_CAPTIONS } from "@/shared/i18n/captions";
import { meetingsController } from "@/shared/network/api/meetingsController";
import { useCurrentUserSpaces } from "@/shared/hooks/use-user";
import { AIContent, Meeting } from "@/shared/types";
import { MySpacesResponse } from "@/shared/types/space";
import AIConversation from "./components/ai-conversation";
import TranscriptionHeader from "./components/transcription-header";
import TranscriptionFilters from "./components/transcription-filters";
import TranscriptionEntry from "./components/transcription-entry";
import ParticipantAvatar from "@/shared/components/participant-avatar";
import { MeetingSpaceCollapsible } from "./components/meeting-space-collapsible";

export default function TranscriptionView() {
  const [aiContents, setAIContents] = useState<AIContent[]>([]);
  const [selectedTab, setSelectedTab] = useState("Transcription");
  const [meeting, setMeeting] = useState<Meeting>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [selectedSpeaker, setSelectedSpeaker] = useState("");
  const [spaces, setSpaces] = useState<MySpacesResponse[] | undefined>([]);

  const params = useParams();
  const meetingId = params.meetingId as string;

  const currentUserSpaces = useCurrentUserSpaces();

  useEffect(() => {
    setSpaces(currentUserSpaces.data);
  }, [currentUserSpaces.data]);

  useEffect(() => {
    const fetchAIContents = async () => {
      const contents = await meetingsController.getAIContents(meetingId);
      if (contents) {
        setAIContents(contents);
      }
    };

    const loadTranscription = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await meetingsController.getTranscription(meetingId);
        setMeeting(data);
      } catch (err) {
        console.error("Failed to load transcription:", err);
        setError("Failed to load transcription data. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    if (meetingId) {
      fetchAIContents();
      loadTranscription();
    }
  }, [meetingId]);

  const speakers: string[] = useMemo(() => {
    if (!meeting?.entries) return [];

    const uniqueParticipants = new Set<string>();
    meeting.entries.forEach((entry) => {
      if (entry?.fullName) {
        uniqueParticipants.add(entry.fullName);
      }
    });

    return Array.from(uniqueParticipants).sort();
  }, [meeting]);

  const filteredEntries = useMemo(() => {
    if (!meeting?.entries) return [];

    let filtered = meeting.entries;

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
  }, [meeting, filterType, selectedSpeaker, searchQuery]);

  const handleSpaceSelection = async (spaceId: string, isSelected: boolean) => {
    try {
      if (isSelected) {
        await meetingsController.addMeetingToSpace(meetingId, spaceId);
        toast.success("Meeting added to space successfully");
      } else {
        await meetingsController.removeMeetingFromSpace(meetingId, spaceId);
        toast.success("Meeting removed from space successfully");
      }
    } catch (err) {
      console.error("Error updating space selection:", err);
      toast.error("Failed to update space selection. Please try again.");
    }
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

  if (!meeting) {
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
      <TranscriptionHeader meeting={meeting} />
      <Tabs
        value={selectedTab}
        onValueChange={setSelectedTab}
        className="w-full gap-0">
        <div className="bg-muted px-6 sticky top-0 z-20 h-12 flex items-center">
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
                      participants={meeting.participants}
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
                <main className="flex-1 py-4 px-6">
                  <div className="">
                    <div className="flex items-center gap-3 text-sm text-gray-600 mb-4">
                      <ParticipantAvatar
                        fullName={meeting.userRecorder.fullName}
                        pictureUrl={meeting.userRecorder.pictureUrl}
                      />
                      <span className="flex flex-col">
                        <span>
                          Recorded by{" "}
                          <span className="font-medium text-gray-900">
                            {meeting.userRecorder.fullName}
                          </span>
                        </span>
                        <span>
                          {format(
                            new Date(meeting.createdAt || Date.now()),
                            "dd MMMM yy",
                          )}{" "}
                          {format(
                            new Date(meeting.createdAt || Date.now()),
                            "HH:mm",
                          )}
                        </span>
                      </span>
                    </div>
                    <SidebarSeparator className="mx-0 mt-4 mb-4 bg-gray-100" />
                    <MeetingSpaceCollapsible
                      defaultOpen={true}
                      spaces={spaces}
                      icon={Blocks}
                      name="Add to your spaces"
                      selectedSpaceIds={meeting.spaces.map((space) => space.id)}
                      onSelect={handleSpaceSelection}
                    />
                    <SidebarSeparator className="mx-0 mt-4 mb-4 bg-gray-100" />
                  </div>
                </main>
              </div>
            </div>
          </div>
        </TabsContent>
        <TabsContent value="AIConversation">
          <AIConversation
            onNewContent={(newContent) =>
              setAIContents((prev) => [...prev, newContent])
            }
            onContentDeleted={(contentId) =>
              setAIContents((prev) =>
                prev.filter((content) => content.id !== contentId),
              )
            }
            aiContents={aiContents}
            meetingId={meetingId}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
