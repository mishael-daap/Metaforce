import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase-client";

export function useProjectName(projectId: string) {
  const [projectName, setProjectName] = useState(projectId);

  useEffect(() => {
    const fetchProjectName = async () => {
      try {
        const { data, error } = await supabase
          .from("projects")
          .select("name")
          .eq("id", projectId)
          .single();

        if (error) {
          console.error("Error fetching project:", error);
        } else if (data?.name) {
          setProjectName(data.name);
        }
      } catch (err) {
        console.error("Failed to fetch project name:", err);
      }
    };

    fetchProjectName();
  }, [projectId]);

  return projectName;
}