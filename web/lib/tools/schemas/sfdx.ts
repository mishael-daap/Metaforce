import { tool } from "ai";
import { z } from "zod";
import {
  objectBodySchema,
  fieldSpecSchema,
} from "@/lib/sfdx/schemas";

/**
 * Schema-only SFDX tools for streamText.
 * Execution happens server-side via /api/tools.
 */
export function sfdxToolSchemas() {
  return {
    createObject: tool({
      description:
        "Queues a job to create a new custom object in the Salesforce org and deploy it. The job will be executed by the SFDX Server worker. Returns the job id.",
      inputSchema: objectBodySchema,
    }),

    updateObject: tool({
      description: "Queues a job to update an existing custom object by API name.",
      inputSchema: z.object({
        apiName: z.string().describe('API name of the object to update'),
        updates: objectBodySchema.describe("Full updated object spec"),
      }),
    }),

    deleteObject: tool({
      description: "Queues a job to delete a custom object.",
      inputSchema: z.object({
        apiName: z.string().describe('API name of the object to delete'),
      }),
    }),

    createField: tool({
      description:
        "Queues a job to create a new custom field on an existing Salesforce object.",
      inputSchema: z.object({
        objectName: z.string().describe('Parent object API name'),
        field: fieldSpecSchema.describe("Field specification"),
      }),
    }),

    updateField: tool({
      description: "Queues a job to update an existing custom field.",
      inputSchema: z.object({
        objectName: z.string().describe('Parent object API name'),
        fieldName: z.string().describe('API name of the field to update'),
        field: fieldSpecSchema.describe("Updated field specification"),
      }),
    }),

    deleteField: tool({
      description: "Queues a job to delete a custom field.",
      inputSchema: z.object({
        objectName: z.string().describe('Parent object API name'),
        fieldName: z.string().describe('API name of the field to delete'),
      }),
    }),
  };
}
