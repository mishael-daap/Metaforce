import { createRequirementTools } from "./requirements";

export { createRequirementTools };

export function createProjectTools(projectId: string) {
  return {
    ...createRequirementTools(projectId),
  };
}
