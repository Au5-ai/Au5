import React from "react";
import { Badge, Card } from "@/shared/components/ui";
import { Assistant } from "@/shared/types/assistants";
import { Bot } from "lucide-react";
import { truncateFirstLine } from "@/shared/lib/utils";

export interface AssistantListProps {
  usedAssistants: Assistant[];
  assistants: Assistant[];
  onClick?: (assistant: Assistant) => void;
}
export const AssistantList: React.FC<AssistantListProps> = ({
  usedAssistants,
  assistants,
  onClick,
}) => {
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
    <div className="grid grid-cols-2 gap-2">
      {assistants.map((assistant) => {
        const isUsed = usedAssistants.some((a) => a.id === assistant.id);
        const cardClass = isUsed
          ? "flex flex-col items-start gap-2 p-3 shadow-none rounded-lg cursor-pointer bg-green-100 border border-green-300"
          : "flex flex-col items-start gap-2 p-3 shadow-none rounded-lg cursor-pointer hover:bg-red-50 hover:shadow-sm";
        return (
          <Card
            onClick={() => onClick?.(assistant)}
            key={assistant.id}
            className={cardClass}>
            <div className="flex items-starts gap-2 w-full">
              <div className="flex flex-col w-full">
                <div className="flex items-center justify-between w-full mb-2">
                  <span className="font-semibold text-gray-900 text-sm flex items-center gap-2">
                    <div>{assistant.icon}</div>
                    <p>{assistant.name}</p>
                  </span>
                  <div className="flex gap-2">
                    {assistant.llmModel && !isUsed && (
                      <Badge
                        variant="secondary"
                        className="flex items-center gap-1">
                        <p>{assistant.llmModel}</p>
                      </Badge>
                    )}
                    {assistant.isDefault && !isUsed && (
                      <Badge
                        variant="secondary"
                        className="flex items-center gap-1">
                        <Bot /> <p>{"Default"}</p>
                      </Badge>
                    )}
                    {isUsed && (
                      <Badge
                        variant="default"
                        className="bg-green-500 text-white dark:bg-green-600">
                        <Bot /> <p>{"In Use"}</p>
                      </Badge>
                    )}
                  </div>
                </div>
                <span className="text-gray-500 text-sm">
                  {truncateFirstLine(assistant.description)}
                </span>
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
};
