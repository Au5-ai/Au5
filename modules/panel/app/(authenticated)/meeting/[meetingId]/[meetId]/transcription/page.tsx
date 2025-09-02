"use client";
import React, { useState, useEffect, useMemo } from "react";
import TranscriptionHeader from "@/components/transcription/transcriptionHeader";
import TranscriptionFilters from "@/components/transcription/transcriptionFilters";
import TranscriptionEntry from "@/components/transcription/transcriptionEntry";
import NoRecordsState, {
  NoSearchResults,
} from "@/components/empty-states/no-record";
import { SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import BreadcrumbLayout from "@/components/breadcrumb-layout";
import { NavActions } from "@/components/navActions";
import { Meeting } from "@/type";

export default function TranscriptionPage() {
  const [transcription, setTranscription] = useState<Meeting>();
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [selectedSpeaker, setSelectedSpeaker] = useState("");

  useEffect(() => {
    loadTranscription();
  }, []);

  const loadTranscription = async () => {
    try {
      setLoading(true);
      const data: Meeting = {
        id: "727cccfe-054d-4c45-8fb2-6762df1197ef",
        title: "TranscriptionMeeting",
        meetingId: "dzc-awqw-ioi",
        userRecorder: {
          id: "edada1f7-cbda-4c13-8504-a57fe72d5960",
          fullName: "Mohammad Karimi",
          pictureUrl:
            "https://lh3.googleusercontent.com/ogw/AF2bZyiAms4ctDeBjEnl73AaUCJ9KbYj2alS08xcAYgAJhETngQ=s64-c-mo",
          email: "mha.karimi@gmail.com",
          hasAccount: true,
        },
        hashToken:
          "D45EE09FC19733549FA1A91E7E7176F572D7BF22F17F712C3C12C3C91FFF7330",
        platform: "GoogleMeet",
        botName: "Candoo",
        isBotAdded: false,
        createdAt: "2025-08-30T00:32:01.1019808",
        duration: "01:21",
        closedAt: "0001-01-01T00:00:00.0000000",
        status: "Ended",
        participants: [
          {
            id: "edada1f7-cbda-4c13-8504-a57fe72d5960",
            fullName: "Mohammad Karimi",
            pictureUrl:
              "https://lh3.googleusercontent.com/ogw/AF2bZyiAms4ctDeBjEnl73AaUCJ9KbYj2alS08xcAYgAJhETngQ=s64-c-mo",
            email: "mha.karimi@gmail.com",
            hasAccount: true,
          },
          {
            id: "edada1f7-cbda-4c13-8504-a57fe72d5960",
            fullName: "Mohammad Karimi1",
            pictureUrl:
              "https://lh3.googleusercontent.com/ogw/AF2bZyiAms4ctDeBjEnl73AaUCJ9KbYj2alS08xcAYgAJhETngQ=s64-c-mo",
            email: "mha.karimi@gmail.com",
            hasAccount: true,
          },
          {
            id: "edada1f7-cbda-4c13-8504-a57fe72d5960",
            fullName: "Mohammad Karimi2",
            pictureUrl:
              "https://lh3.googleusercontent.com/ogw/AF2bZyiAms4ctDeBjEnl73AaUCJ9KbYj2alS08xcAYgAJhETngQ=s64-c-mo",
            email: "mha.karimi@gmail.com",
            hasAccount: true,
          },
          {
            id: "edada1f7-cbda-4c13-8504-a57fe72d5960",
            fullName: "Mohammad Karimi3",
            pictureUrl:
              "https://lh3.googleusercontent.com/ogw/AF2bZyiAms4ctDeBjEnl73AaUCJ9KbYj2alS08xcAYgAJhETngQ=s64-c-mo",
            email: "mha.karimi@gmail.com",
            hasAccount: true,
          },
          {
            id: "edada1f7-cbda-4c13-8504-a57fe72d5960",
            fullName: "Mohammad Karimi4",
            pictureUrl:
              "https://lh3.googleusercontent.com/ogw/AF2bZyiAms4ctDeBjEnl73AaUCJ9KbYj2alS08xcAYgAJhETngQ=s64-c-mo",
            email: "mha.karimi@gmail.com",
            hasAccount: true,
          },
          {
            id: "edada1f7-cbda-4c13-8504-a57fe72d5960",
            fullName: "Mohammad Karimi5",
            pictureUrl:
              "https://lh3.googleusercontent.com/ogw/AF2bZyiAms4ctDeBjEnl73AaUCJ9KbYj2alS08xcAYgAJhETngQ=s64-c-mo",
            email: "mha.karimi@gmail.com",
            hasAccount: true,
          },
          {
            id: "edada1f7-cbda-4c13-8504-a57fe72d5960",
            fullName: "Mohammad Karimi6",
            pictureUrl:
              "https://lh3.googleusercontent.com/ogw/AF2bZyiAms4ctDeBjEnl73AaUCJ9KbYj2alS08xcAYgAJhETngQ=s64-c-mo",
            email: "mha.karimi@gmail.com",
            hasAccount: true,
          },
        ],
        guests: [
          {
            id: "00000000-0000-0000-0000-000000000000",
            fullName: "Ali A",
            pictureUrl: "",
            hasAccount: false,
            email: "",
          },
        ],
        entries: [
          {
            blockId: "fb0e0485-3bd4-4e6f-9c2e-90706fc90ea9",
            participantId: "edada1f7-cbda-4c13-8504-a57fe72d5960",
            fullName: "Mohammad Karimi",
            pictureUrl: "",
            content: "Sfdljadf",
            timestamp: "2025-08-29T14:33:56.4980000",
            timeline: "09:58:04",
            entryType: "Chat",
            reactions: [
              {
                id: 3,
                type: "Goal",
                emoji: "⚡",
                className:
                  "reaction-task bg-blue-100 text-blue-700 border-blue-200",
                participants: [
                  {
                    id: "edada1f7-cbda-4c13-8504-a57fe72d5960",
                    fullName: "",
                    pictureUrl: "",
                    email: "",
                    hasAccount: false,
                  },
                ],
              },
              {
                id: 2,
                type: "GoodPoint",
                emoji: "⭐",
                className:
                  "reaction-important bg-amber-100 text-amber-700 border-amber-200",
                participants: [
                  {
                    id: "edada1f7-cbda-4c13-8504-a57fe72d5960",
                    fullName: "",
                    pictureUrl: "",
                    email: "",
                    hasAccount: false,
                  },
                ],
              },
              {
                id: 1,
                type: "Task",
                emoji: "🎯",
                className:
                  "reaction-question bg-rose-100 text-rose-700 border-rose-200",
                participants: [
                  {
                    id: "edada1f7-cbda-4c13-8504-a57fe72d5960",
                    fullName: "",
                    pictureUrl: "",
                    email: "",
                    hasAccount: false,
                  },
                ],
              },
            ],
          },
        ],
      };
      setTranscription(data);
    } catch (error) {
      console.error("Error loading transcription:", error);
    } finally {
      setLoading(false);
    }
  };

  const participants: string[] = useMemo(() => {
    if (!transcription?.entries) return [];

    const uniqueParticipants = new Set<string>();
    transcription.participants.forEach((participant) => {
      if (participant?.fullName) {
        uniqueParticipants.add(participant.fullName);
      }
    });

    transcription.guests.forEach((guest) => {
      if (guest?.fullName) {
        uniqueParticipants.add(guest.fullName);
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
        (entry) => entry?.fullName === selectedSpeaker
      );
    }

    if (searchQuery) {
      filtered = filtered.filter(
        (entry) =>
          entry.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
          entry?.fullName.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    return filtered;
  }, [transcription, filterType, selectedSpeaker, searchQuery]);

  if (loading) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading Transcription...</p>
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
        <TranscriptionHeader meeting={transcription} />
        <TranscriptionFilters
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          filterType={filterType}
          setFilterType={setFilterType}
          selectedSpeaker={selectedSpeaker}
          setSelectedSpeaker={setSelectedSpeaker}
          participants={participants}
        />
        <div className="w-[800px]">
          <div className="bg-white overflow-hidden">
            {filteredEntries.length > 0 ? (
              <div className="divide-y divide-gray-100">
                {filteredEntries.map((entry, index) => (
                  <TranscriptionEntry
                    key={entry.blockId}
                    entry={entry}
                    index={index}
                  />
                ))}
              </div>
            ) : (
              <NoSearchResults />
            )}
          </div>
        </div>
        <div className="h-20" />
      </div>
    </SidebarInset>
  );
}
