"use client";

import { useState, useEffect } from "react";
import { UIMessage } from "@ai-sdk/react";
import { File } from "lucide-react";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { RequirementsList } from "@/components/chat/requirements-list";
import {Chat } from "./chat"
import { useProjectName } from "@/hooks/use-project-name";
import { useRequirements } from "@/hooks/use-requirements";

interface ProjectChatProps {
  projectId: string;
  initialMessages: UIMessage[];
}

export default function ProjectChat({ projectId, initialMessages }: ProjectChatProps) {
  const [showPanel, setShowPanel] = useState(false);
  const [mode, setMode] = useState<"plan" | "build">("plan");

  const projectName = useProjectName(projectId);
  const {
    requirements,
    loading,
    panelShouldOpen,
    clearPanelSignal,
    refresh,
    handleUpdate,
    handleDelete,
  } = useRequirements(projectId);

  // Open panel automatically when the hook signals new requirements arrived
  useEffect(() => {
    if (panelShouldOpen) {
      setShowPanel(true);
      clearPanelSignal();
    }
  }, [panelShouldOpen, clearPanelSignal]);

  return (
    <div className="h-screen flex flex-col p-4 overflow-hidden">
      <div className="flex justify-between items-center">
        <div className="text-lg font-medium">{projectName}</div>
        <File
          className="cursor-pointer"
          onClick={() => setShowPanel((prev) => !prev)}
        />
      </div>

      <ResizablePanelGroup orientation="horizontal" className="w-screen">
        <ResizablePanel defaultSize="60%">
          <Chat
            projectId={projectId}
            initialMessages={initialMessages}
            onFinish={refresh}
            mode={mode}
            setMode={setMode}
          />
        </ResizablePanel>

        <ResizableHandle className="bg-transparent" withHandle />

        {showPanel && (
          <ResizablePanel className="pt-4 pr-4 pb-4 animate-in slide-in-from-right">
            <div className="h-full overflow-y-auto">
              {loading ? (
                <div className="flex h-full items-center justify-center">
                  <span>Loading requirements...</span>
                </div>
              ) : (
                <RequirementsList
                  requirements={requirements}
                  onUpdate={handleUpdate}
                  onDelete={handleDelete}
                />
              )}
            </div>
          </ResizablePanel>
        )}
      </ResizablePanelGroup>
    </div>
  );
}