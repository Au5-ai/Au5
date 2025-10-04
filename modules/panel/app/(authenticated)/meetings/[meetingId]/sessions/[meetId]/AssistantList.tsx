import React from "react";
import { Card } from "@/shared/components/ui";
import { Badge } from "@/shared/components/ui/badge";
import { Assistant } from "@/shared/types/assistants";
import { Bot, BadgeCheckIcon, Trash } from "lucide-react";
import { GLOBAL_CAPTIONS } from "@/shared/i18n/captions";

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
          <div className="flex items-start gap-2 w-full">
            <div>{assistant.icon}</div>
            <div className="flex flex-col flex-1">
              <div className="flex items-center justify-between w-full">
                <span className="font-semibold text-gray-900 text-sm">
                  {assistant.name}
                </span>
                <Badge variant={assistant.isActive ? "secondary" : "destructive"} className="text-xs">
                  {assistant.isActive ? (
                    <>
                      <BadgeCheckIcon className="w-3 h-3 mr-1" /> {GLOBAL_CAPTIONS.status.enabled}
                    </>
                  ) : (
                    <>
                      <Trash className="w-3 h-3 mr-1" /> {GLOBAL_CAPTIONS.status.disabled}
                    </>
                  )}
                </Badge>
              </div>
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
