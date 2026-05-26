import { useState, useEffect, useCallback } from "react";
import { getProjectRequirements, updateRequirement, deleteRequirement  } from "@/app/project/[projectId]/actions";

import type { Requirement } from "@/src/types/requirements";

function hashRequirements(requirements: Requirement[]) {
  return requirements
    .map((r) => `${r.id}-${r.title}-${r.description}-${r.status}`)
    .join("|");
}

export function useRequirements(projectId: string) {
  const [requirements, setRequirements] = useState<Requirement[]>([]);
  const [loading, setLoading] = useState(true);
  const [panelShouldOpen, setPanelShouldOpen] = useState(false);
  const [previousHash, setPreviousHash] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    try {
      const reqs = await getProjectRequirements(projectId);
      setRequirements(reqs);
    } catch (err) {
      console.error("Failed to fetch requirements:", err);
      setRequirements([]);
    }
  }, [projectId]);

  // Initial fetch
  useEffect(() => {
    const initialFetch = async () => {
      setLoading(true);
      await refresh();
      setLoading(false);
    };
    initialFetch();
  }, [refresh]);

  // Auto-open panel when requirements change after initial load
  useEffect(() => {
    const currentHash = hashRequirements(requirements);

    if (previousHash === null) {
      // First load — just record the hash, don't open the panel
      setPreviousHash(currentHash);
    } else if (currentHash !== previousHash && requirements.length > 0) {
      setPanelShouldOpen(true);
      setPreviousHash(currentHash);
    }
  }, [requirements, previousHash]);

  const handleUpdate = async (id: string, title: string, description: string) => {
    const result = await updateRequirement(id, title, description, projectId);
    if (result.success) {
      await refresh();
    } else {
      console.error("Failed to update requirement:", result.error);
    }
  };

  const handleDelete = async (id: string) => {
    const result = await deleteRequirement(id, projectId);
    if (result.success) {
      await refresh();
    } else {
      console.error("Failed to delete requirement:", result.error);
    }
  };

  const clearPanelSignal = () => setPanelShouldOpen(false);

  return {
    requirements,
    loading,
    panelShouldOpen,
    clearPanelSignal,
    refresh,
    handleUpdate,
    handleDelete,
  };
}