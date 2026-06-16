import { createCustomObject, deleteCustomObject } from '../services/customObject.js';
import { createCustomField, deleteCustomField } from '../services/customField.js';
import { deployMetadata } from '../services/deploy.js';
import { deleteMetadata } from '../services/deleteMetadata.js';

export interface JobInput {
  id: string;
  project_id: string;
  type: string;
  payload: Record<string, any>;
}

export interface JobResult {
  success: boolean;
  components?: Array<{ fullName: string; type: string; xml?: string }>;
  error?: string;
}

export async function executeJob(job: JobInput): Promise<JobResult> {
  console.log(`[Worker] Executing job ${job.id} - type: ${job.type}`);

  const { payload } = job;
  const projectId = job.project_id;

  switch (job.type) {
    case 'create_object':
      return handleCreateObject(projectId, payload);

    case 'create_field':
      return handleCreateField(projectId, payload);

    case 'update_object':
      return handleUpdateObject(projectId, payload);

    case 'update_field':
      return handleUpdateField(projectId, payload);

    case 'delete_object':
      return handleDeleteObject(projectId, payload);

    case 'delete_field':
      return handleDeleteField(projectId, payload);

    default:
      return { success: false, error: `Unknown job type: ${job.type}` };
  }
}

async function handleCreateObject(projectId: string, payload: any): Promise<JobResult> {
  const spec = payload;
  const createResult = await createCustomObject(projectId, spec);

  if (!createResult.success) {
    return { success: false, error: createResult.error };
  }

  const deployResult = await deployMetadata({ projectId, targetOrg: projectId });

  if (!deployResult.success) {
    return {
      success: false,
      error: deployResult.error,
      components: [{ fullName: spec.fullName, type: 'CustomObject', xml: createResult.xml }]
    };
  }

  return {
    success: true,
    components: [{ fullName: spec.fullName, type: 'CustomObject', xml: createResult.xml }]
  };
}

async function handleCreateField(projectId: string, payload: any): Promise<JobResult> {
  const { objectName, field } = payload;
  const createResult = await createCustomField(projectId, objectName, field);

  if (!createResult.success) {
    return { success: false, error: createResult.error };
  }

  const deployResult = await deployMetadata({ projectId, targetOrg: projectId });

  if (!deployResult.success) {
    return {
      success: false,
      error: deployResult.error,
      components: [{ fullName: field.fullName, type: 'CustomField', xml: createResult.xml }]
    };
  }

  return {
    success: true,
    components: [{ fullName: field.fullName, type: 'CustomField', xml: createResult.xml }]
  };
}

async function handleUpdateObject(projectId: string, payload: any): Promise<JobResult> {
  const { updates } = payload;
  const createResult = await createCustomObject(projectId, updates);

  if (!createResult.success) {
    return { success: false, error: createResult.error };
  }

  const deployResult = await deployMetadata({ projectId, targetOrg: projectId });

  if (!deployResult.success) {
    return {
      success: false,
      error: deployResult.error,
      components: [{ fullName: updates.fullName, type: 'CustomObject', xml: createResult.xml }]
    };
  }

  return {
    success: true,
    components: [{ fullName: updates.fullName, type: 'CustomObject', xml: createResult.xml }]
  };
}

async function handleUpdateField(projectId: string, payload: any): Promise<JobResult> {
  const { objectName, field } = payload;
  const createResult = await createCustomField(projectId, objectName, field);

  if (!createResult.success) {
    return { success: false, error: createResult.error };
  }

  const deployResult = await deployMetadata({ projectId, targetOrg: projectId });

  if (!deployResult.success) {
    return {
      success: false,
      error: deployResult.error,
      components: [{ fullName: field.fullName, type: 'CustomField', xml: createResult.xml }]
    };
  }

  return {
    success: true,
    components: [{ fullName: field.fullName, type: 'CustomField', xml: createResult.xml }]
  };
}

async function handleDeleteObject(projectId: string, payload: any): Promise<JobResult> {
  const { apiName } = payload;

  // First deploy the deletion to the org
  const deleteResult = await deleteMetadata({
    projectId,
    metadataType: 'CustomObject',
    fullName: apiName
  });

  if (!deleteResult.success) {
    return { success: false, error: deleteResult.error };
  }

  // Then delete the local files
  await deleteCustomObject(projectId, apiName);

  return {
    success: true,
    components: [{ fullName: apiName, type: 'CustomObject' }]
  };
}

async function handleDeleteField(projectId: string, payload: any): Promise<JobResult> {
  const { objectName, fieldName } = payload;

  // First deploy the deletion to the org
  const qualifiedName = `${objectName}.${fieldName}`;
  const deleteResult = await deleteMetadata({
    projectId,
    metadataType: 'CustomField',
    fullName: qualifiedName
  });

  if (!deleteResult.success) {
    return { success: false, error: deleteResult.error };
  }

  // Then delete the local files
  await deleteCustomField(projectId, objectName, fieldName);

  return {
    success: true,
    components: [{ fullName: fieldName, type: 'CustomField' }]
  };
}
