import React from "react";
import { Badge, Card } from "@/shared/components/ui";
import { Assistant } from "@/shared/types/assistants";
import { Bot, Brain } from "lucide-react";

export interface AssistantListProps {
  assistants: Assistant[];
  onClick?: (assistant: Assistant) => void;
}
export const AssistantList: React.FC<AssistantListProps> = ({
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
    <div className="grid grid-cols-1 gap-2">
      {assistants.map((assistant) => (
        <Card
          onClick={() => onClick?.(assistant)}
          key={assistant.id}
          className="flex flex-col items-start gap-2 p-3 shadow-none rounded-lg cursor-pointer hover:bg-red-50 hover:shadow-sm">
          <div className="flex items-starts gap-2 w-full">
            <div>{assistant.icon}</div>
            <div className="flex flex-col w-full">
              <div className="flex items-center justify-between w-full mb-2">
                <span className="font-semibold text-gray-900 text-sm">
                  {assistant.name}
                </span>
                <div className="flex gap-2">
                  {assistant.llmModel && (
                    <Badge
                      variant="secondary"
                      className="flex items-center gap-1">
                      <Brain /> <p>{assistant.llmModel}</p>
                    </Badge>
                  )}
                  {assistant.isDefault && (
                    <Badge
                      variant="secondary"
                      className="flex items-center gap-1">
                      <Bot /> <p>{"Default"}</p>
                    </Badge>
                  )}
                </div>
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
