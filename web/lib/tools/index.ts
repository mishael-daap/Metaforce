import { createRequirementTools } from "./requirements";
import { createActionTools } from "./actions";

export { createRequirementTools, createActionTools };

export function createProjectTools(projectId: string) {
  return {
    ...createRequirementTools(projectId),
    ...createActionTools(),
  };
}
