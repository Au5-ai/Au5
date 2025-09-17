"use client";
import React, { useState, useEffect, useMemo } from "react";
import { useParams } from "next/navigation";
import { Meeting } from "@/shared/types";
import { meetingApi } from "@/shared/network/api/meeting";
import NoRecordsState from "@/shared/components/empty-states/no-record";
import { NoSearchResults } from "@/shared/components/empty-states/no-search-result";
import { SidebarInset, SidebarTrigger } from "@/shared/components/ui";
import { Separator } from "@radix-ui/react-separator";
import BreadcrumbLayout from "@/shared/components/breadcrumb-layout";
import { NavActions } from "@/shared/components/navActions";
import TranscriptionHeader from "@/shared/components/transcription/transcriptionHeader";
import TranscriptionFilters from "@/shared/components/transcription/transcriptionFilters";
import TranscriptionEntry from "@/shared/components/transcription/transcriptionEntry";

export default function TranscriptionPage() {
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
      <div className="min-h-screen w-full flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading Transcription...</p>
        </div>
      </div>
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
          speakers={speakers}
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
      </div>
    </SidebarInset>
  );
}
