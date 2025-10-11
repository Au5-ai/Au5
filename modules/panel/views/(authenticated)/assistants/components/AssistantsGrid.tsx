import { Assistant } from "@/shared/types/assistants";
import { Card } from "@/shared/components/ui";
import { Badge } from "@/shared/components/ui/badge";
import NoRecordsState from "@/shared/components/empty-states/no-record";
import { BadgeCheckIcon, Brain, Trash } from "lucide-react";

interface AssistantsGridProps {
  assistants: Assistant[];
  isLoading: boolean;
}

export function AssistantsGrid({ assistants, isLoading }: AssistantsGridProps) {
  if (isLoading) {
    return <div className="text-center py-8">Loading...</div>;
  }
  if (!assistants.length) {
    return <NoRecordsState />;
  }
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 mt-8">
      {assistants.map((assistant) => (
        <Card
          key={assistant.id}
          className={`p-4 flex flex-col gap-2 items-start${assistant.isActive === false ? " border-2 border-red-500" : ""}`}>
          <div className="flex items-center gap-2 mb-1 w-full">
            {assistant.icon && (
              <span className="text-2xl" title="icon">
                {assistant.icon}
              </span>
            )}
            <span className="font-semibold text-lg flex-1">
              {assistant.name}
            </span>

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
          </div>
          <div className="text-muted-foreground text-sm">
            {assistant.instructions}
          </div>
        </Card>
      ))}
    </div>
  );
}
