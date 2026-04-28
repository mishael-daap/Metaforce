import { z } from 'zod';

export const ActionSchema = z.object({
  id: z.string().describe('Unique action identifier e.g. action_1'),
  tool: z.enum(['createObject', 'createField', 'deploy']),
  label: z.string().describe('Human readable description of this step'),
  dependsOn: z.array(z.string()).describe('IDs of actions that must complete first'),
});

export const RequirementSchema = z.object({
  id: z.string().describe('Unique requirement identifier e.g. req_1'),
  name: z.string().describe('Short name for this requirement'),
  description: z.string().describe('Detailed description of what this requirement entails'),
  actions: z.array(ActionSchema).describe('Ordered list of actions to fulfill this requirement'),
});

export const ExecutionPlanSchema = z.object({
  requirements_summary: z.string().describe('One sentence summary of all requirements'),
  requirements: z.array(RequirementSchema).describe('List of requirements with their actions'),
});

export type Action = z.infer<typeof ActionSchema>;
export type Requirement = z.infer<typeof RequirementSchema>;
export type ExecutionPlan = z.infer<typeof ExecutionPlanSchema>;
