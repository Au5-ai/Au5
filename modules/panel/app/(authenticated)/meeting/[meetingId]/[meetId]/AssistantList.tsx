import React from "react";
import { Card } from "@/shared/components/ui";
import { AiIcon } from "@/shared/components/ui/ai";
import { Assistant } from "@/shared/types/assistants";
import { Bot } from "lucide-react";

export interface AssistantListProps {
  assistants: Assistant[];
}

export const AssistantList: React.FC<AssistantListProps> = ({ assistants }) => {
  if (!assistants.length) {
    return (
      <div className="bg-red-100 w-full p-2 rounded-lg flex items-center">
        <Bot className="mr-2 w-4 h-4" />
        <span className="text-sm">
          Sorry, There is no active AI Assistant :(
        </span>
      </div>
    );
  }
  return (
    <div className="grid grid-cols-1 gap-2">
      {assistants.map((assistant) => (
        <Card
          key={assistant.id}
          className="flex flex-col items-start gap-2 p-2 shadow-none rounded-lg cursor-pointer hover:bg-muted hover:shadow-sm">
          <div className="flex items-starts gap-2">
            <div>
              <AiIcon className="w-8 h-8 fill-gold" />
            </div>
            <div className="flex flex-col">
              <span className="font-semibold text-gray-900 text-sm">
                {assistant.name}
              </span>
              <span className="text-gray-500 text-sm">
                {assistant.description}
              </span>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
};
