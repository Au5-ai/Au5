"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  Label,
} from "@/shared/components/ui";
import { Input, Button } from "@/shared/components/ui";
import { ASSISTANTS_CAPTIONS } from "../i18n";
import { Textarea } from "@/shared/components/ui/textarea";
import { Bot } from "lucide-react";
import { Emojis } from "../models";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";

interface AddAssistantModalProps {
  open: boolean;
  onClose: () => void;
  onAdd: (data: {
    icon: string;
    name: string;
    llmModel: string;
    instructions: string;
    description: string;
  }) => Promise<void>;
  isLoading: boolean;
}

export function AddAssistantModal({
  open,
  onClose,
  onAdd,
  isLoading,
}: AddAssistantModalProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [instructions, setInstructions] = useState("");
  const [llmModel, setLlmModel] = useState("gpt-4o");
  const [icon, setIcon] = useState("🤖");
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    if (!name.trim()) {
      setError("Name is required");
      return;
    }
    await onAdd({
      name: name.trim(),
      llmModel,
      instructions: instructions.trim(),
      description: description.trim(),
      icon,
    });
    setName("");
    setInstructions("");
    setDescription("");
    setIcon("🤖");
    setLlmModel("gpt-4o");
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3 text-xl font-semibold text-gray-900">
            <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
              <Bot className="w-5 h-5 text-gray-600" />
            </div>
            {ASSISTANTS_CAPTIONS.addAITools}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Label htmlFor="icon" className="text-sm font-medium text-gray-700">
            Icon
          </Label>
          <div className="flex flex-wrap gap-2 mb-2">
            {Emojis.map((e) => (
              <button
                type="button"
                key={e}
                className={`text-2xl cursor-pointer px-1 py-1 rounded border ${icon === e ? "border-black bg-gray-100" : "border-transparent hover:border-gray-300"}`}
                onClick={() => setIcon(e)}
                aria-label={`Select ${e}`}
                tabIndex={0}
                disabled={isLoading}>
                {e}
              </button>
            ))}
          </div>
          <Label htmlFor="name" className="text-sm font-medium text-gray-700">
            {ASSISTANTS_CAPTIONS.fields.name}
          </Label>
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Assistant name"
            disabled={isLoading}
            required
          />

          <Label htmlFor="llmModel">LLM Model</Label>
          <Select
            name="llmModel"
            value={llmModel}
            onValueChange={(value) => setLlmModel(value)}>
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="w-full">
              <SelectItem value="gpt-4.1">gpt-4.1</SelectItem>
              <SelectItem value="gpt-4.1-mini">gpt-4.1-mini</SelectItem>
              <SelectItem value="gpt-4.1-nano">gpt-4.1-nano</SelectItem>
              <SelectItem value="gpt-4o">gpt-4o</SelectItem>
              <SelectItem value="gpt-4o-mini">gpt-4o-mini</SelectItem>
              <SelectItem value="o3-mini">o3-mini</SelectItem>
              <SelectItem value="o1">o1</SelectItem>
              <SelectItem value="gpt-4-turbo">gpt-4-turbo</SelectItem>
              <SelectItem value="gpt-4">gpt-4</SelectItem>
              <SelectItem value="gpt-3.5-turbo">gpt-3.5-turbo</SelectItem>
            </SelectContent>
          </Select>

          <Label
            htmlFor="instructions"
            className="text-sm font-medium text-gray-700">
            {ASSISTANTS_CAPTIONS.fields.instructions}
          </Label>
          <Textarea
            value={instructions}
            onChange={(e) => setInstructions(e.target.value)}
            placeholder="You are a summarization assistant. Read the provided transcription and generate ..."
            disabled={isLoading}
            rows={5}
            className="max-h-32 overflow-y-auto resize-none"
          />

          <Label
            htmlFor="description"
            className="text-sm font-medium text-gray-700">
            {ASSISTANTS_CAPTIONS.fields.description}
          </Label>
          <Textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Description (optional)"
            disabled={isLoading}
            rows={2}
            className="max-h-12 overflow-y-auto resize-none"
          />
          {error && <div className="text-red-500 text-sm">{error}</div>}
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isLoading}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Adding..." : "Add"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
