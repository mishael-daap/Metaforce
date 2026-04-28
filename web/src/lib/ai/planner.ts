import { generateText, Output } from 'ai';
import { groq } from '@ai-sdk/groq';
import { ExecutionPlanSchema } from '@/lib/schemas/plan-schemas';

export const PLANNER_SYSTEM_PROMPT = [
  'You are a Salesforce configuration assistant.',
  'Given natural language requirements, generate a structured execution plan.',
  'Rules:',
  '- Only use custom objects and custom fields',
  '- Always end with a deploy action',
  '- Objects must be created before their fields (respect dependsOn)',
  '- Topologically sort actions so dependsOn references always point to earlier actions',
  '- Use __c suffix for all custom object and field API names',
].join('\n');

export async function generatePlan(requirements: string) {
  const result = await generateText({
    model: groq('meta-llama/llama-4-scout-17b-16e-instruct'),
    output: Output.object({
      name: 'ExecutionPlan',
      description: 'A structured Salesforce metadata deployment plan',
      schema: ExecutionPlanSchema,
    }),
    system: PLANNER_SYSTEM_PROMPT,
    prompt: requirements,
  });

  return result.output;
}
