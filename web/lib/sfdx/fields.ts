import { tool } from 'ai';
import { z } from 'zod';
import type { SfdxClient } from './client';

// -------------------------------------------------------
// Shared Schemas
// -------------------------------------------------------

const picklistValueSchema = z.object({
  fullName: z.string().describe('API name of the picklist value'),
  label: z.string().describe('Display label'),
  default: z.boolean().optional().describe('Whether this is the default value'),
});

const valueSetSchema = z.object({
  restricted: z
    .boolean()
    .optional()
    .describe('Restrict to defined values only'),
  sorted: z.boolean().optional().describe('Sort values alphabetically'),
  values: z.array(picklistValueSchema).describe('Picklist values'),
});

const fieldSpecSchema = z.object({
  fullName: z
    .string()
    .describe('API name of the field. Must end in __c, e.g. "Description__c"'),
  label: z.string().describe('Display label for the field'),
  type: z
    .enum([
      'Text',
      'TextArea',
      'LongTextArea',
      'Number',
      'Currency',
      'Checkbox',
      'Date',
      'DateTime',
      'Email',
      'Phone',
      'Url',
      'Picklist',
      'Lookup',
    ])
    .describe('Field type'),
  description: z.string().optional().describe('Field description'),
  inlineHelpText: z.string().optional().describe('Help text shown inline in UI'),
  required: z.boolean().optional().describe('Whether the field is required'),
  trackHistory: z.boolean().optional().describe('Track field history'),

  // Text / LongTextArea
  length: z
    .number()
    .optional()
    .describe('Max character length. Applies to Text and LongTextArea'),

  // LongTextArea
  visibleLines: z
    .number()
    .optional()
    .describe('Lines visible in UI. Applies to LongTextArea'),

  // Number / Currency
  precision: z
    .number()
    .optional()
    .describe('Total digit count. Applies to Number and Currency'),
  scale: z
    .number()
    .optional()
    .describe('Decimal digit count. Applies to Number and Currency'),

  // Checkbox
  defaultValue: z
    .boolean()
    .optional()
    .describe('Default checked state. Applies to Checkbox'),

  // Lookup
  referenceTo: z
    .string()
    .optional()
    .describe('Target object API name. Required for Lookup, e.g. "Account"'),
  relationshipName: z
    .string()
    .optional()
    .describe('Relationship API name. Required for Lookup'),
  relationshipLabel: z
    .string()
    .optional()
    .describe('Relationship display label. Required for Lookup'),
  deleteConstraint: z
    .enum(['SetNull', 'Restrict', 'Cascade'])
    .optional()
    .describe('Delete constraint. Applies to Lookup'),

  // Picklist
  valueSet: valueSetSchema
    .optional()
    .describe('Picklist values. Required for Picklist type'),
});

// -------------------------------------------------------
// Tools
// -------------------------------------------------------

export function createFieldTools(client: SfdxClient) {
  const { request } = client;

  const createField = tool({
    description:
      'Creates a new custom field on an existing Salesforce object and deploys it to the org.',
    inputSchema: z.object({
      objectName: z
        .string()
        .describe('Parent object API name, e.g. "Tenant__c"'),
      field: fieldSpecSchema.describe('Field specification'),
    }),
    execute: async ({ objectName, field }) => {
      const res = await request('POST', '/metadata/fields', {
        objectName,
        field,
      });
      return res.components[0];
    },
  });

  const updateField = tool({
    description:
      'Updates an existing custom field on a Salesforce object. The field fullName must match fieldName.',
    inputSchema: z.object({
      objectName: z
        .string()
        .describe('Parent object API name, e.g. "Tenant__c"'),
      fieldName: z
        .string()
        .describe('API name of the field to update, e.g. "Description__c"'),
      field: fieldSpecSchema.describe('Updated field specification'),
    }),
    execute: async ({ objectName, fieldName, field }) => {
      const res = await request(
        'PUT',
        `/metadata/fields/${objectName}/${fieldName}`,
        { field },
      );
      return res.components[0];
    },
  });

  const deleteField = tool({
    description:
      'Deletes a custom field from a Salesforce object and removes its local XML file.',
    inputSchema: z.object({
      objectName: z
        .string()
        .describe('Parent object API name, e.g. "Tenant__c"'),
      fieldName: z
        .string()
        .describe('API name of the field to delete, e.g. "Description__c"'),
    }),
    execute: async ({ objectName, fieldName }) => {
      const res = await request(
        'DELETE',
        `/metadata/fields/${objectName}/${fieldName}`,
      );
      return res.components[0];
    },
  });

  return {
    createField,
    updateField,
    deleteField,
  };
}
