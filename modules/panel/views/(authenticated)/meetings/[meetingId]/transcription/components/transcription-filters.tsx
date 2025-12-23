import React from "react";
import { Search, Mic, Users, MessageCircle } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";

type TranscriptionFiltersProps = {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  filterType: string;
  setFilterType: (type: string) => void;
  selectedSpeaker: string;
  setSelectedSpeaker: (speaker: string) => void;
  speakers: string[];
};

export default function TranscriptionFilters({
  searchQuery,
  setSearchQuery,
  filterType,
  setFilterType,
  selectedSpeaker,
  setSelectedSpeaker,
  speakers,
}: TranscriptionFiltersProps) {
  const filterButtons = [
    { key: "all", label: "All", icon: null },
    { key: "transcription", label: "Transcription", icon: Mic },
    { key: "chat", label: "Chat", icon: MessageCircle },
  ];

  return (
    <div className="bg-white">
      <div className="px-6 py-4">
        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Search in conversation..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 border-0 bg-gray-50 focus:bg-white transition-colors"
            />
          </div>

          <div className="flex items-center gap-1 bg-gray-50 rounded-lg p-1">
            {filterButtons.map((button) => {
              const Icon = button.icon;
              return (
                <Button
                  key={button.key}
                  variant={filterType === button.key ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setFilterType(button.key)}
                  className={`cursor-pointer px-3 h-8 ${
                    filterType === button.key
                      ? "bg-white shadow-sm text-gray-900 hover:bg-white"
                      : "text-gray-600 hover:text-gray-900"
                  }`}>
                  {Icon && <Icon className="w-3.5 h-3.5 mr-1.5" />}
                  {button.label}
                </Button>
              );
            })}
          </div>

          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-gray-400" />
            <Select
              value={selectedSpeaker || "all"}
              onValueChange={setSelectedSpeaker}>
              <SelectTrigger className="w-[180px] border-0 bg-gray-50 focus:border hover:border transition-colors cursor-pointer">
                <SelectValue placeholder="All Speakers" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all" className="cursor-pointer">
                  All Speakers
                </SelectItem>
                {speakers.map((speaker, index) => (
                  <SelectItem
                    key={index}
                    value={speaker}
                    className="cursor-pointer">
                    {speaker}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
    </div>
  );
}
