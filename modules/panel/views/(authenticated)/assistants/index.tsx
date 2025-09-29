"use client";

import BreadcrumbLayout from "@/shared/components/breadcrumb-layout";
import {
  Button,
  Separator,
  SidebarInset,
  SidebarTrigger,
} from "@/shared/components/ui";
import { ASSISTANTS_CAPTIONS } from "./i18n";
import { useEffect, useState } from "react";
import { Assistant } from "@/shared/types/assistants";
import { assistantsController } from "@/shared/network/api/assistantsController";
import { Plus } from "lucide-react";
import { AssistantsGrid } from "./components/AssistantsGrid";
import { AddAssistantModal } from "./components/AddAssistantModal";
import { toast } from "sonner";

export default function AssistantsPage() {
  const [assistants, setAssistants] = useState<Assistant[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [isAdding, setIsAdding] = useState(false);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    setIsLoading(true);
    try {
      const fetchedAIs = await assistantsController.getActive();
      setAssistants(fetchedAIs);
    } catch (error) {
      console.error(ASSISTANTS_CAPTIONS.errorLoading, error);
    }
    setIsLoading(false);
  };

  const handleAddAssistant = async (data: {
    name: string;
    prompt: string;
    description: string;
    icon: string;
  }) => {
    setIsAdding(true);
    try {
      await assistantsController.create(data);
      setShowAddModal(false);
      toast.success(ASSISTANTS_CAPTIONS.successAdd);
      await loadUsers();
    } catch (error) {
      console.error("Error adding assistant", error);
    }
    setIsAdding(false);
  };

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
          {/* Render a component passed from children via a prop */}
        </div>
      </header>
      <div className="flex flex-1 flex-col px-6 py-4">
        <div className="container mx-auto mb-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold mb-1">
              {ASSISTANTS_CAPTIONS.title}
            </h1>
            <p className="text-muted-foreground">
              {ASSISTANTS_CAPTIONS.description}
            </p>
          </div>
          <div>
            <Button
              onClick={() => setShowAddModal(true)}
              className="bg-black hover:bg-gray-800 text-white">
              <Plus className="w-5 h-5 mr-2" />
              {ASSISTANTS_CAPTIONS.addAITools}
            </Button>
          </div>
        </div>
        <div className="min-h-screen w-full">
          <div className="max-w-7xl mx-auto">
            <AssistantsGrid assistants={assistants} isLoading={isLoading} />
            <AddAssistantModal
              open={showAddModal}
              onClose={() => setShowAddModal(false)}
              onAdd={handleAddAssistant}
              isLoading={isAdding}
            />
          </div>
        </div>
      </div>
    </SidebarInset>
  );
}
