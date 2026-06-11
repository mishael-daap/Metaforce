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
import { cn } from "@/lib/utils";

interface ProjectChatProps {
  projectId: string;
  initialMessages: UIMessage[];
}

function usePersistedState<T>(key: string, defaultValue: T): [T, React.Dispatch<React.SetStateAction<T>>] {
  const [state, setState] = useState<T>(defaultValue);

  // Read from localStorage only on the client, after initial mount.
  // This avoids SSR hydration mismatches: both server and client render
  // the same defaultValue first, then the client applies stored value.
  useEffect(() => {
    try {
      const stored = localStorage.getItem(key);
      if (stored !== null) {
        setState(JSON.parse(stored) as T);
      }
    } catch {
      // corrupt data or unavailable storage — keep default
    }
  }, [key]);

  // Write to localStorage whenever state changes on the client.
  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(state));
    } catch {
      // storage full or unavailable — silently fail
    }
  }, [key, state]);

  return [state, setState];
}

export default function ProjectChat({ projectId, initialMessages }: ProjectChatProps) {
  const [showPanel, setShowPanel] = usePersistedState<boolean>(
    `metaforce:${projectId}:showPanel`,
    false
  );
  const [mode, setMode] = usePersistedState<"plan" | "build">(
    `metaforce:${projectId}:mode`,
    "plan"
  );

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
        <ResizablePanel defaultSize="60%" className={cn(
    "max-w-4xl max-h-[90vh] px-10",
    "flex-1 overflow-y-auto",
    "[&::-webkit-scrollbar]:w-2",
    "[&::-webkit-scrollbar-track]:bg-transparent",
    "[&::-webkit-scrollbar-thumb]:bg-border",
    "[&::-webkit-scrollbar-thumb]:rounded-full",
    "hover:[&::-webkit-scrollbar-thumb]:bg-muted-foreground/30",
  )}>
          <Chat
            projectId={projectId}
            initialMessages={initialMessages}
            onFinish={refresh}
            mode={mode}
            setMode={setMode}
          />
        </ResizablePanel>

        {showPanel && (
          <ResizablePanel className="pt-4 px-4 pb-4 animate-in slide-in-from-right">
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