import { tool } from 'ai';
import { z } from 'zod';
import { SfdxClient } from './client';

// -------------------------------------------------------
// Shared Schemas
// -------------------------------------------------------

const nameFieldSchema = z.object({
  label: z.string().describe('Display label for the name field'),
  type: z.enum(['Text', 'AutoNumber']).describe('Name field type'),
  displayFormat: z
    .string()
    .optional()
    .describe('Required when type is AutoNumber, e.g. "OBJ-{0000}"'),
  trackHistory: z.boolean().optional().describe('Track field history'),
});

const objectBodySchema = z.object({
  fullName: z
    .string()
    .describe('API name of the object. Must end in __c, e.g. "Tenant__c"'),
  label: z.string().describe('Singular display label, e.g. "Tenant"'),
  pluralLabel: z.string().describe('Plural display label, e.g. "Tenants"'),
  description: z.string().optional().describe('Object description'),
  deploymentStatus: z
    .enum(['Deployed', 'InDevelopment'])
    .optional()
    .describe('Defaults to Deployed'),
  sharingModel: z
    .enum(['ReadWrite', 'Private', 'ControlledByParent'])
    .describe('Sharing model for the object'),
  visibility: z
    .enum(['Public', 'PackageProtected'])
    .describe('Object visibility'),
  nameField: nameFieldSchema.describe('Configuration for the Name field'),
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
// Tools
// -------------------------------------------------------

export function createObjectTools(client: SfdxClient) {
  const { request } = client;

  const listObjects = tool({
    description:
      'Lists all custom objects in the Salesforce project. Returns the API name, type, and XML for each object.',
    inputSchema: z.object({}),
    execute: async () => {
      const res = await request('GET', '/metadata/objects');
      return res.components.map(c => ({ fullName: c.fullName, type: c.type }));
    },
  });

  const getObject = tool({
    description:
      'Retrieves a specific custom object by API name, including all its child field definitions.',
    inputSchema: z.object({
      apiName: z
        .string()
        .describe('API name of the object to retrieve, e.g. "Tenant__c"'),
    }),
    execute: async ({ apiName }) => {
      const res = await request('GET', `/metadata/objects/${apiName}`);
      return {
        object: res.components[0],
        fields: res.detail?.fields ?? [],
      };
    },
  });

  const createObject = tool({
    description:
      'Creates a new custom object in the Salesforce org and deploys it. Use this when a requirement calls for a new data entity.',
    inputSchema: objectBodySchema,
    execute: async input => {
      const res = await request('POST', '/metadata/objects', input);
      return res.components[0];
    },
  });

  const updateObject = tool({
    description:
      'Updates an existing custom object by API name. The fullName in the body must match the apiName param.',
    inputSchema: z.object({
      apiName: z
        .string()
        .describe('API name of the object to update, e.g. "Tenant__c"'),
      updates: objectBodySchema.describe('Full updated object spec'),
    }),
    execute: async ({ apiName, updates }) => {
      const res = await request('PUT', `/metadata/objects/${apiName}`, updates);
      return res.components[0];
    },
  });

  const deleteObject = tool({
    description:
      'Deletes a custom object from the Salesforce org and removes its local project files.',
    inputSchema: z.object({
      apiName: z
        .string()
        .describe('API name of the object to delete, e.g. "Tenant__c"'),
    }),
    execute: async ({ apiName }) => {
      const res = await request('DELETE', `/metadata/objects/${apiName}`);
      return res.components[0];
    },
  });

  return {
    listObjects,
    getObject,
    createObject,
    updateObject,
    deleteObject,
  };
}
