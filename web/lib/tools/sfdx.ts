import { tool } from "ai";
import { z } from "zod";

const SFDX_SERVER_URL = process.env.SFDX_SERVER_URL!;
const SFDX_SERVER_API_KEY = process.env.SFDX_SERVER_API_KEY!;

interface SfdxCredentials {
  projectId: string;
  accessToken: string;
  orgUrl: string;
}

function sfdxHeaders(ctx: SfdxCredentials) {
  return {
    "Content-Type": "application/json",
    "x-api-key": SFDX_SERVER_API_KEY,
    "x-project-id": ctx.projectId,
    "x-access-token": ctx.accessToken,
    "x-org-url": ctx.orgUrl,
  };
}

async function sfdxFetch(path: string, ctx: SfdxCredentials, options?: RequestInit) {
  const url = `${SFDX_SERVER_URL}${path}`;
  const res = await fetch(url, {
    ...options,
    headers: { ...sfdxHeaders(ctx), ...(options?.headers ?? {}) },
  });
  return res.json();
}

// --- Reusable Zod schemas ---

const nameFieldSchema = z.object({
  label: z.string().describe("Display label for the name field"),
  type: z.enum(["Text", "AutoNumber"]).describe("Name field type"),
  displayFormat: z.string().optional().describe("Required when type is AutoNumber"),
  scale: z.number().optional().describe("Scale for numeric types"),
  trackHistory: z.boolean().optional().describe("Track field history"),
});

const picklistValueSchema = z.object({
  fullName: z.string().describe("API name of the picklist value"),
  label: z.string().describe("Display label for the value"),
  default: z.boolean().optional().describe("Whether this is the default value"),
});

const valueSetSchema = z.object({
  restricted: z.boolean().optional().describe("Restrict values to the defined set"),
  sorted: z.boolean().optional().describe("Sort values alphabetically"),
  values: z.array(picklistValueSchema).describe("List of picklist values"),
});

const fieldType = z.enum([
  "Text", "TextArea", "LongTextArea", "Html", "EncryptedText",
  "Number", "Currency", "Percent", "Location", "Checkbox",
  "Date", "DateTime", "Time", "Email", "Phone", "Url",
  "AutoNumber", "Lookup", "MasterDetail", "Picklist",
  "MultiselectPicklist", "Formula", "Summary",
]);

const fieldSchema = z.object({
  fullName: z.string().describe("API name of the field. Must end in __c"),
  label: z.string().describe("Display label"),
  type: fieldType.describe("Salesforce field type"),
  description: z.string().optional().describe("Field description"),
  inlineHelpText: z.string().optional().describe("Help text shown inline"),
  required: z.boolean().optional().describe("Whether the field is required"),
  trackHistory: z.boolean().optional().describe("Track field history"),
  trackTrending: z.boolean().optional().describe("Track trending"),
  // Text types
  length: z.number().optional().describe("Max character length (Text, LongTextArea, Html, EncryptedText)"),
  externalId: z.boolean().optional().describe("Mark as external ID (Text, Number, Email, AutoNumber, EncryptedText)"),
  unique: z.boolean().optional().describe("Enforce uniqueness (Text, Number, Email)"),
  visibleLines: z.number().optional().describe("Lines visible in UI (LongTextArea, Html, MultiselectPicklist)"),
  // EncryptedText
  maskChar: z.enum(["asterisk", "X"]).optional().describe("Mask character for EncryptedText"),
  maskType: z.enum(["all", "lastFour", "creditCard", "sin", "socialSecurityNumber", "nino"]).optional().describe("Mask type for EncryptedText"),
  // Numeric types
  precision: z.number().optional().describe("Total digit count (Number, Currency, Percent, Formula)"),
  scale: z.number().optional().describe("Decimal digit count (Number, Currency, Percent, Location, Formula)"),
  displayLocationInDecimal: z.boolean().optional().describe("Show location in decimal (Location)"),
  // Checkbox
  defaultValue: z.boolean().optional().describe("Default checked state (Checkbox)"),
  // AutoNumber
  displayFormat: z.string().optional().describe("Auto-number format string (AutoNumber)"),
  // Relationship types
  referenceTo: z.string().optional().describe("Target object API name (Lookup, MasterDetail)"),
  relationshipName: z.string().optional().describe("Relationship API name (Lookup, MasterDetail)"),
  relationshipLabel: z.string().optional().describe("Relationship display label (Lookup, MasterDetail)"),
  deleteConstraint: z.enum(["SetNull", "Restrict", "Cascade"]).optional().describe("Delete constraint (Lookup)"),
  relationshipOrder: z.number().optional().describe("Order in master-detail (MasterDetail)"),
  reparentableMasterDetail: z.boolean().optional().describe("Allow reparenting (MasterDetail)"),
  writeRequiresMasterRead: z.boolean().optional().describe("Write requires master read (MasterDetail)"),
  // Picklist types
  valueSet: valueSetSchema.optional().describe("Picklist value set (Picklist, MultiselectPicklist)"),
  // Formula
  formula: z.string().optional().describe("Formula expression (Formula)"),
  formulaTreatBlanksAs: z.enum(["BlankAsZero", "BlankAsBlank"]).optional().describe("How to treat blanks in formulas"),
  returnType: z.enum(["Text", "Number", "Currency", "Percent", "Date", "DateTime", "Checkbox"]).optional().describe("Formula return type (Formula)"),
  // Summary
  summaryForeignKey: z.string().optional().describe("Summary relationship key (Summary)"),
  summaryOperation: z.enum(["COUNT", "SUM", "MIN", "MAX"]).optional().describe("Summary operation (Summary)"),
  summarizedField: z.string().optional().describe("Field to summarize (Summary, required when operation is not COUNT)"),
});

// --- Tool factory ---

export function createSfdxTools(ctx: SfdxCredentials) {
  return {
    projectSetup: tool({
      description:
        "Initialize the SFDX project and authenticate with the Salesforce org. Call this before any other SFDX tool to ensure the project is ready.",
      inputSchema: z.object({}),
      execute: async () => {
        return sfdxFetch("/metadata/project-setup", ctx, { method: "POST" });
      },
    }),

    fetchLatest: tool({
      description:
        "Retrieve the latest metadata from the connected Salesforce org and sync the local project. Use this to refresh the project's metadata state from the org.",
      inputSchema: z.object({}),
      execute: async () => {
        return sfdxFetch("/metadata/fetch-latest", ctx, { method: "POST" });
      },
    }),

    listObjects: tool({
      description:
        "List all custom objects in the project. Returns each object's API name and XML definition.",
      inputSchema: z.object({}),
      execute: async () => {
        return sfdxFetch("/metadata/objects", ctx);
      },
    }),

    createObject: tool({
      description:
        "Create a new custom object in the Salesforce org. The object is written locally and deployed to the org.",
      inputSchema: z.object({
        fullName: z.string().describe("API name. Must end in __c"),
        label: z.string().describe("Singular display label"),
        pluralLabel: z.string().describe("Plural display label"),
        description: z.string().optional().describe("Object description"),
        deploymentStatus: z.enum(["Deployed", "InDevelopment"]).optional().describe("Defaults to Deployed"),
        sharingModel: z.enum(["ReadWrite", "Private", "ControlledByParent"]).describe("Sharing model"),
        externalSharingModel: z.string().optional().describe("External sharing model"),
        visibility: z.enum(["Public", "PackageProtected"]).describe("Object visibility"),
        nameField: nameFieldSchema.describe("Name field specification"),
        allowInChatterGroups: z.boolean().optional().describe("Allow in Chatter groups"),
        enableActivities: z.boolean().optional().describe("Enable activities"),
        enableBulkApi: z.boolean().optional().describe("Enable Bulk API"),
        enableFeeds: z.boolean().optional().describe("Enable feeds"),
        enableHistory: z.boolean().optional().describe("Enable history"),
        enableReports: z.boolean().optional().describe("Enable reports"),
        enableSearch: z.boolean().optional().describe("Enable search"),
        enableSharing: z.boolean().optional().describe("Enable sharing"),
        enableStreamingApi: z.boolean().optional().describe("Enable Streaming API"),
        compactLayoutAssignment: z.string().optional().describe("Compact layout assignment"),
      }),
      execute: async (body) => {
        return sfdxFetch("/metadata/objects", ctx, {
          method: "POST",
          body: JSON.stringify(body),
        });
      },
    }),

    getObject: tool({
      description:
        "Get a specific custom object by API name, including its XML definition and all child field definitions.",
      inputSchema: z.object({
        apiName: z.string().describe("API name of the object (e.g. MyObject__c)"),
      }),
      execute: async ({ apiName }) => {
        return sfdxFetch(`/metadata/objects/${encodeURIComponent(apiName)}`, ctx);
      },
    }),

    updateObject: tool({
      description:
        "Update an existing custom object by overwriting its XML and redeploying to the org. The fullName in the body must match the object's API name.",
      inputSchema: z.object({
        apiName: z.string().describe("API name of the object to update"),
        fullName: z.string().describe("API name. Must match apiName and end in __c"),
        label: z.string().describe("Singular display label"),
        pluralLabel: z.string().describe("Plural display label"),
        description: z.string().optional().describe("Object description"),
        deploymentStatus: z.enum(["Deployed", "InDevelopment"]).optional().describe("Defaults to Deployed"),
        sharingModel: z.enum(["ReadWrite", "Private", "ControlledByParent"]).describe("Sharing model"),
        externalSharingModel: z.string().optional().describe("External sharing model"),
        visibility: z.enum(["Public", "PackageProtected"]).describe("Object visibility"),
        nameField: nameFieldSchema.describe("Name field specification"),
        allowInChatterGroups: z.boolean().optional().describe("Allow in Chatter groups"),
        enableActivities: z.boolean().optional().describe("Enable activities"),
        enableBulkApi: z.boolean().optional().describe("Enable Bulk API"),
        enableFeeds: z.boolean().optional().describe("Enable feeds"),
        enableHistory: z.boolean().optional().describe("Enable history"),
        enableReports: z.boolean().optional().describe("Enable reports"),
        enableSearch: z.boolean().optional().describe("Enable search"),
        enableSharing: z.boolean().optional().describe("Enable sharing"),
        enableStreamingApi: z.boolean().optional().describe("Enable Streaming API"),
        compactLayoutAssignment: z.string().optional().describe("Compact layout assignment"),
      }),
      execute: async ({ apiName, ...body }) => {
        return sfdxFetch(`/metadata/objects/${encodeURIComponent(apiName)}`, ctx, {
          method: "PUT",
          body: JSON.stringify(body),
        });
      },
    }),

    deleteObject: tool({
      description:
        "Delete a custom object from the Salesforce org and remove its local project files.",
      inputSchema: z.object({
        apiName: z.string().describe("API name of the object to delete (e.g. MyObject__c)"),
      }),
      execute: async ({ apiName }) => {
        return sfdxFetch(`/metadata/objects/${encodeURIComponent(apiName)}`, ctx, {
          method: "DELETE",
        });
      },
    }),

    createField: tool({
      description:
        "Create a new custom field on an existing custom object and deploy it to the org.",
      inputSchema: z.object({
        objectName: z.string().describe("Parent object API name (e.g. MyObject__c)"),
        field: fieldSchema.describe("Field specification"),
      }),
      execute: async ({ objectName, field }) => {
        return sfdxFetch("/metadata/fields", ctx, {
          method: "POST",
          body: JSON.stringify({ objectName, field }),
        });
      },
    }),

    updateField: tool({
      description:
        "Update an existing custom field by overwriting its XML and redeploying to the org. The fullName in the field spec must match the field's current API name.",
      inputSchema: z.object({
        objectName: z.string().describe("Parent object API name (e.g. MyObject__c)"),
        fieldName: z.string().describe("API name of the field to update (e.g. Description__c)"),
        field: fieldSchema.describe("Field specification. fullName must match fieldName"),
      }),
      execute: async ({ objectName, fieldName, field }) => {
        return sfdxFetch(`/metadata/fields/${encodeURIComponent(objectName)}/${encodeURIComponent(fieldName)}`, ctx, {
          method: "PUT",
          body: JSON.stringify({ field }),
        });
      },
    }),

    deleteField: tool({
      description:
        "Delete a custom field from the Salesforce org and remove its local file.",
      inputSchema: z.object({
        objectName: z.string().describe("Parent object API name (e.g. MyObject__c)"),
        fieldName: z.string().describe("API name of the field to delete (e.g. Description__c)"),
      }),
      execute: async ({ objectName, fieldName }) => {
        return sfdxFetch(`/metadata/fields/${encodeURIComponent(objectName)}/${encodeURIComponent(fieldName)}`, ctx, {
          method: "DELETE",
        });
      },
    }),
  };
}
