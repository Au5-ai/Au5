"use client";

// import BreadcrumbLayout from "@/components/breadcrumb-layout";
// import { NavActions } from "@/components/navActions";
// import { Separator } from "@/components/ui/separator";
// import { SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
// import { useParams } from "next/navigation";

// export default function TranscriptionPage() {
//   const params = useParams();
//   const meetingId = params.meetingId as string;
//   const meetId = params.meetId as string;

//   return (
//     <SidebarInset>
//       <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
//         <div className="flex items-center gap-2 px-4">
//           <SidebarTrigger className="-ml-1" />
//           <Separator
//             orientation="vertical"
//             className="mr-2 data-[orientation=vertical]:h-4"
//           />
//           <BreadcrumbLayout />
//         </div>
//         <div className="ml-auto px-4">
//           <NavActions />
//         </div>
//       </header>
//       <div className="flex flex-1 flex-col">
//         <div className="container mx-auto p-2 px-4">
//           <h1 className="text-2xl font-bold mb-1">Meeting Transcription</h1>
//         </div>
//         <div className="container mx-auto p-4 text-sm text-muted-foreground">
//           <p>
//             Meeting ID: <span className="font-mono">{meetingId}</span>
//           </p>
//           <p>
//             Meet ID: <span className="font-mono">{meetId}</span>
//           </p>
//         </div>
//       </div>
//     </SidebarInset>
//   );
// }

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

export default function TranscriptionsPage() {
  const [transcriptions, setTranscriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [selectedSpeaker, setSelectedSpeaker] = useState("");

  useEffect(() => {
    loadTranscriptions();
  }, []);

  const loadTranscriptions = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `https://app.base44.com/api/apps/68b52cb6bb3ec60c1db71cb9/entities/Transcription`,
        {
          headers: {
            api_key: "836108fbf6bb4440bb3df4ac173a0f4e", // or use await User.me() to get the API key
            "Content-Type": "application/json",
          },
        }
      );
      const data = await response.json();

      setTranscriptions(data);
    } catch (error) {
      console.error("Error loading transcriptions:", error);
    } finally {
      setLoading(false);
    }
  };

  // Get the latest transcription for display
  const currentTranscription = transcriptions[0];

  // Get unique speakers
  const speakers = useMemo(() => {
    if (!currentTranscription?.entries) return [];

    const uniqueSpeakers = new Set();
    currentTranscription.entries.forEach((entry) => {
      if (entry.speaker?.fullName) {
        uniqueSpeakers.add(entry.speaker.fullName);
      }
    });

    return Array.from(uniqueSpeakers).sort();
  }, [currentTranscription]);

  // Filter entries
  const filteredEntries = useMemo(() => {
    if (!currentTranscription?.entries) return [];

    let filtered = currentTranscription.entries;

    // Filter by type
    if (filterType !== "all") {
      const targetType =
        filterType === "transcription" ? "Transcription" : "Chat";
      filtered = filtered.filter((entry) => entry.entryType === targetType);
    }

    // Filter by speaker
    if (selectedSpeaker && selectedSpeaker !== "all") {
      filtered = filtered.filter(
        (entry) => entry.speaker?.fullName === selectedSpeaker
      );
    }

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(
        (entry) =>
          entry.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
          entry.speaker?.fullName
            .toLowerCase()
            .includes(searchQuery.toLowerCase())
      );
    }

    return filtered;
  }, [currentTranscription, filterType, selectedSpeaker, searchQuery]);

  if (loading) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading transcription...</p>
        </div>
      </div>
    );
  }

  if (!currentTranscription) {
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
        <TranscriptionHeader transcription={currentTranscription} />
        <TranscriptionFilters
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          filterType={filterType}
          setFilterType={setFilterType}
          selectedSpeaker={selectedSpeaker}
          setSelectedSpeaker={setSelectedSpeaker}
          speakers={speakers}
        />

        {/* Main Content */}
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

        {/* Footer spacing */}
        <div className="h-20" />
      </div>
    </SidebarInset>
  );
}
