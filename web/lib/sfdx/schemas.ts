import { z } from "zod";

// -------------------------------------------------------
// Name Field Schema
// -------------------------------------------------------
export const nameFieldSchema = z.object({
  label: z.string().describe("Display label for the name field"),
  type: z.enum(["Text", "AutoNumber"]).describe("Name field type"),
  displayFormat: z
    .string()
    .optional()
    .describe('Required when type is AutoNumber, e.g. "OBJ-{0000}"'),
  trackHistory: z.boolean().optional().describe("Track field history"),
});

// -------------------------------------------------------
// Object Body Schema
// -------------------------------------------------------
export const objectBodySchema = z.object({
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

// -------------------------------------------------------
// Picklist / ValueSet Schemas
// -------------------------------------------------------
export const picklistValueSchema = z.object({
  fullName: z.string().describe("API name of the picklist value"),
  label: z.string().describe("Display label"),
  default: z.boolean().optional().describe("Whether this is the default value"),
});

export const valueSetSchema = z.object({
  restricted: z.boolean().optional().describe("Restrict to defined values only"),
  sorted: z.boolean().optional().describe("Sort values alphabetically"),
  values: z.array(picklistValueSchema).describe("Picklist values"),
});

// -------------------------------------------------------
// Field Spec Schema
// -------------------------------------------------------
export const fieldSpecSchema = z.object({
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
  referenceTo: z.string().optional().describe('Target object API name. Required for Lookup, e.g. Dil"Account"'),
  relationshipName: z.string().optional().describe("Relationship API name. Required for Lookup"),
  relationshipLabel: z.string().optional().describe("Relationship display label. Required for Lookup"),
  deleteConstraint: z
    .enum(["SetNull", "Restrict", "Cascade"])
    .optional()
    .describe("Delete constraint. Applies to Lookup"),
  valueSet: valueSetSchema.optional().describe("Picklist values. Required for Picklist type"),
});
