import { Assistant } from "@/shared/types/assistants";
import { Card } from "@/shared/components/ui";

interface AssistantsGridProps {
  assistants: Assistant[];
  isLoading: boolean;
}

export function AssistantsGrid({ assistants, isLoading }: AssistantsGridProps) {
  if (isLoading) {
    return <div className="text-center py-8">Loading...</div>;
  }
  if (!assistants.length) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No assistants found.
      </div>
    );
  }
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 mt-8">
      {assistants.map((assistant) => (
        <Card
          key={assistant.id}
          className="p-4 flex flex-col gap-2 items-start">
          <div className="flex items-center gap-2 mb-1">
            {assistant.icon && (
              <span className="text-2xl" title="icon">
                {assistant.icon}
              </span>
            )}
            <span className="font-semibold text-lg">{assistant.name}</span>
          </div>
          <div className="text-muted-foreground text-sm">
            {assistant.prompt}
          </div>
        </Card>
      ))}
    </div>
  );
}
