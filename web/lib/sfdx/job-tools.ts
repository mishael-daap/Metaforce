import { tool } from "ai";
import { z } from "zod";
import { supabase } from "@/lib/supabase";

// -------------------------------------------------------
// Shared Schemas (same as objects.ts / fields.ts)
// -------------------------------------------------------

const nameFieldSchema = z.object({
  label: z.string().describe("Display label for the name field"),
  type: z.enum(["Text", "AutoNumber"]).describe("Name field type"),
  displayFormat: z
    .string()
    .optional()
    .describe('Required when type is AutoNumber, e.g. "OBJ-{0000}"'),
  trackHistory: z.boolean().optional().describe("Track field history"),
});

const objectBodySchema = z.object({
  fullName: z
    .string()
    .describe('API name of the object. Must end in __c, e.g. "Tenant__c"'),
  label: z.string().describe('Singular display label, e.g. "Tenant"'),
  pluralLabel: z.string().describe('Plural display label, e.g. "Tenants"'),
  description: z.string().optional().describe("Object description"),
  deploymentStatus: z
    .enum(["Deployed", "InDevelopment"])
    .optional()
    .describe("Defaults to Deployed"),
  sharingModel: z
    .enum(["ReadWrite", "Private", "ControlledByParent"])
    .describe("Sharing model for the object"),
  visibility: z
    .enum(["Public", "PackageProtected"])
    .describe("Object visibility"),
  nameField: nameFieldSchema.describe("Configuration for the Name field"),
  allowInChatterGroups: z.boolean().optional(),
  enableActivities: z.boolean().optional(),
  enableBulkApi: z.boolean().optional(),
  enableFeeds: z.boolean().optional(),
  enableHistory: z.boolean().optional(),
  enableReports: z.boolean().optional(),
  enableSearch: z.boolean().optional(),
  enableSharing: z.boolean().optional(),
  enableStreamingApi: z.boolean().optional(),
});

const picklistValueSchema = z.object({
  fullName: z.string().describe("API name of the picklist value"),
  label: z.string().describe("Display label"),
  default: z.boolean().optional().describe("Whether this is the default value"),
});

const valueSetSchema = z.object({
  restricted: z.boolean().optional().describe("Restrict to defined values only"),
  sorted: z.boolean().optional().describe("Sort values alphabetically"),
  values: z.array(picklistValueSchema).describe("Picklist values"),
});

const fieldSpecSchema = z.object({
  fullName: z
    .string()
    .describe('API name of the field. Must end in __c, e.g. "Description__c"'),
  label: z.string().describe("Display label for the field"),
  type: z
    .enum([
      "Text",
      "TextArea",
      "LongTextArea",
      "Number",
      "Currency",
      "Checkbox",
      "Date",
      "DateTime",
      "Email",
      "Phone",
      "Url",
      "Picklist",
      "Lookup",
    ])
    .describe("Field type"),
  description: z.string().optional().describe("Field description"),
  inlineHelpText: z.string().optional().describe("Help text shown inline in UI"),
  required: z.boolean().optional().describe("Whether the field is required"),
  trackHistory: z.boolean().optional().describe("Track field history"),
  length: z.number().optional().describe("Max character length. Applies to Text and LongTextArea"),
  visibleLines: z.number().optional().describe("Lines visible in UI. Applies to LongTextArea"),
  precision: z.number().optional().describe("Total digit count. Applies to Number and Currency"),
  scale: z.number().optional().describe("Decimal digit count. Applies to Number and Currency"),
  defaultValue: z.boolean().optional().describe("Default checked state. Applies to Checkbox"),
  referenceTo: z.string().optional().describe('Target object API name. Required for Lookup, e.g. "Account"'),
  relationshipName: z.string().optional().describe("Relationship API name. Required for Lookup"),
  relationshipLabel: z.string().optional().describe("Relationship display label. Required for Lookup"),
  deleteConstraint: z
    .enum(["SetNull", "Restrict", "Cascade"])
    .optional()
    .describe("Delete constraint. Applies to Lookup"),
  valueSet: valueSetSchema.optional().describe("Picklist values. Required for Picklist type"),
});

// -------------------------------------------------------
// In-memory store for the latest job id per project
// (sent back to the UI so the panel auto-opens)
// -------------------------------------------------------
export const latestJobPerProject = new Map<string, string>();

async function insertJob(
  projectId: string,
  type: string,
  payload: Record<string, unknown>
) {
  const { data, error } = await supabase
    .from("jobs")
    .insert({
      project_id: projectId,
      type,
      payload: payload as any,
      status: "pending",
    })
    .select("id")
    .single();

  if (error) {
    throw new Error(`Failed to queue job: ${error.message}`);
  }

  latestJobPerProject.set(projectId, data.id);
  return data.id;
}

// -------------------------------------------------------
// Object Tools (insert jobs)
// -------------------------------------------------------

export function createJobObjectTools(projectId: string) {
  const createObject = tool({
    description:
      "Queues a job to create a new custom object in the Salesforce org and deploy it. The job will be executed by the SFDX Server worker. Returns the job id. Use this when a requirement calls for a new data entity.",
    inputSchema: objectBodySchema,
    execute: async (input) => {
      const jobId = await insertJob(projectId, "create_object", input);
      return {
        jobId,
        status: "pending",
        message: `Job #${jobId} queued to create custom object "${input.fullName}". You can monitor its progress in the jobs panel.`,
      };
    },
  });

  const updateObject = tool({
    description:
      "Queues a job to update an existing custom object by API name. The job will be executed by the SFDX Server worker.",
    inputSchema: z.object({
      apiName: z.string().describe('API name of the object to update, e.g. "Tenant__c"'),
      updates: objectBodySchema.describe("Full updated object spec"),
    }),
    execute: async ({ apiName, updates }) => {
      const jobId = await insertJob(projectId, "update_object", { apiName, updates });
      return {
        jobId,
        status: "pending",
        message: `Job #${jobId} queued to update custom object "${apiName}".`,
      };
    },
  });

  const deleteObject = tool({
    description:
      "Queues a job to delete a custom object from the Salesforce org. The job will be executed by the SFDX Server worker.",
    inputSchema: z.object({
      apiName: z.string().describe('API name of the object to delete, e.g. "Tenant__c"'),
    }),
    execute: async ({ apiName }) => {
      const jobId = await insertJob(projectId, "delete_object", { apiName });
      return {
        jobId,
        status: "pending",
        message: `Job #${jobId} queued to delete custom object "${apiName}".`,
      };
    },
  });

  return {
    createObject,
    updateObject,
    deleteObject,
  };
}

// -------------------------------------------------------
// Field Tools (insert jobs)
// -------------------------------------------------------

export function createJobFieldTools(projectId: string) {
  const createField = tool({
    description:
      "Queues a job to create a new custom field on an existing Salesforce object and deploy it. The job will be executed by the SFDX Server worker.",
    inputSchema: z.object({
      objectName: z.string().describe('Parent object API name, e.g. "Tenant__c"'),
      field: fieldSpecSchema.describe("Field specification"),
    }),
    execute: async ({ objectName, field }) => {
      const jobId = await insertJob(projectId, "create_field", { objectName, field });
      return {
        jobId,
        status: "pending",
        message: `Job #${jobId} queued to create field "${field.fullName}" on object "${objectName}".`,
      };
    },
  });

  const updateField = tool({
    description:
      "Queues a job to update an existing custom field on a Salesforce object. The job will be executed by the SFDX Server worker.",
    inputSchema: z.object({
      objectName: z.string().describe('Parent object API name, e.g. "Tenant__c"'),
      fieldName: z.string().describe('API name of the field to update, e.g. "Description__c"'),
      field: fieldSpecSchema.describe("Updated field specification"),
    }),
    execute: async ({ objectName, fieldName, field }) => {
      const jobId = await insertJob(projectId, "update_field", { objectName, fieldName, field });
      return {
        jobId,
        status: "pending",
        message: `Job #${jobId} queued to update field "${fieldName}" on "${objectName}".`,
      };
    },
  });

  const deleteField = tool({
    description:
      "Queues a job to delete a custom field from a Salesforce object. The job will be executed by the SFDX Server worker.",
    inputSchema: z.object({
      objectName: z.string().describe('Parent object API name, e.g. "Tenant__c"'),
      fieldName: z.string().describe('API name of the field to delete, e.g. "Description__c"'),
    }),
    execute: async ({ objectName, fieldName }) => {
      const jobId = await insertJob(projectId, "delete_field", { objectName, fieldName });
      return {
        jobId,
        status: "pending",
        message: `Job #${jobId} queued to delete field "${fieldName}" from "${objectName}".`,
      };
    },
  });

  return {
    createField,
    updateField,
    deleteField,
  };
}

// -------------------------------------------------------
// Full toolset factory
// -------------------------------------------------------

export function createSfdxJobTools(projectId: string) {
  return {
    ...createJobObjectTools(projectId),
    ...createJobFieldTools(projectId),
  };
}
