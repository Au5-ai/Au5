import { Assistant } from "@/shared/types/assistants";
import { Card } from "@/shared/components/ui";
import { Badge } from "@/shared/components/ui/badge";
import NoRecordsState from "@/shared/components/empty-states/no-record";
import { BadgeCheckIcon, Brain, Shield, Trash } from "lucide-react";
import { useState } from "react";
import { LoadingPage } from "@/shared/components/loading-page";

interface AssistantsGridProps {
  assistants: Assistant[];
  isLoading: boolean;
}

interface AssistantCardProps {
  assistant: Assistant;
}

function AssistantCard({ assistant }: AssistantCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const shouldTruncate =
    assistant.instructions && assistant.instructions.length > 100;

  return (
    <Card
      key={assistant.id}
      className={`p-4 flex flex-col gap-2 items-start${assistant.isActive === false ? " border-2 border-red-500" : ""}`}>
      <div className="flex items-start gap-2 w-full">
        {assistant.icon && (
          <span className="text-4xl" title="icon">
            {assistant.icon}
          </span>
        )}
        <div className="flex-1 flex flex-col gap-2">
          <span className="font-semibold text-lg">{assistant.name}</span>
          <div className="flex flex-wrap items-center gap-2">
            {assistant.llmModel && (
              <Badge variant="secondary" className="flex items-center gap-1">
                <Brain /> <p>{assistant.llmModel}</p>
              </Badge>
            )}
            <Badge variant={assistant.isActive ? "secondary" : "destructive"}>
              {assistant.isActive ? (
                <>
                  <BadgeCheckIcon /> {"Enabled"}
                </>
              ) : (
                <>
                  <Trash /> {"Disabled"}
                </>
              )}
            </Badge>

            <Badge
              variant="default"
              className="flex items-center gap-1 bg-blue-100 text-blue-800">
              {assistant.isDefault ? (
                <>
                  <BadgeCheckIcon /> {"Public for all users"}
                </>
              ) : (
                <>
                  <Shield /> {"Private"}
                </>
              )}
            </Badge>
          </div>
        </div>
      </div>
      <div className="text-muted-foreground text-sm mt-4" dir="auto">
        {shouldTruncate && !isExpanded ? (
          <>
            {assistant.instructions?.substring(0, 100)}...{" "}
            <button
              onClick={() => setIsExpanded(true)}
              className="italic text-xs text-blue-500 hover:text-blue-600 underline cursor-pointer">
              (see more)
            </button>
          </>
        ) : (
          <>
            {assistant.instructions}
            {shouldTruncate && (
              <>
                {" "}
                <button
                  onClick={() => setIsExpanded(false)}
                  className="italic text-xs text-blue-500 hover:text-blue-600 underline cursor-pointer">
                  (see less)
                </button>
              </>
            )}
          </>
        )}
      </div>
    </Card>
  );
}

export function AssistantsGrid({ assistants, isLoading }: AssistantsGridProps) {
  if (isLoading) {
    return (
      <LoadingPage text="Loading assistants..." className="min-h-screen" />
    );
  }
  if (!assistants.length) {
    return <NoRecordsState />;
  }
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 gap-6 mt-8">
      {assistants.map((assistant) => (
        <AssistantCard key={assistant.id} assistant={assistant} />
      ))}
    </div>
  );
}
