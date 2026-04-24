import * as fs from 'fs';
import * as path from 'path';
import type { CustomObjectSpec } from '../types/CustomObjectSpec.js';
import { buildCustomObjectXml } from '../xml/builders/customObjectBuilder.js';

export interface CreateCustomObjectResult {
  success: boolean;
  outputPath?: string;
  error?: string;
  [key: string]: unknown;
}

export async function createCustomObject(
  projectId: string,
  spec: CustomObjectSpec
): Promise<CreateCustomObjectResult> {
  try {
    // Validate inputs
    const validationResult = validateInputs(projectId, spec);
    if (!validationResult.valid) {
      return {
        success: false,
        error: validationResult.error
      };
    }

    // Extract object name from fullName (e.g., "MyObject__c")
    const objectName = spec.fullName;

    // Build output path: [projectId]/force-app/objects/<ObjectName>/
    const outputDir = path.join(process.cwd(), projectId, 'force-app', 'objects', objectName);

    // Create directory if it doesn't exist (overwrite if exists)
    if (fs.existsSync(outputDir)) {
      fs.rmSync(outputDir, { recursive: true, force: true });
    }
    fs.mkdirSync(outputDir, { recursive: true });

    // Build XML content
    const xmlContent = buildCustomObjectXml(spec);

    // Write XML file: <ObjectName>__c.object-meta.xml
    const xmlFileName = `${objectName}.object-meta.xml`;
    const xmlFilePath = path.join(outputDir, xmlFileName);
    fs.writeFileSync(xmlFilePath, xmlContent, 'utf-8');

    return {
      success: true,
      outputPath: xmlFilePath
    };
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
    return {
      success: false,
      error: errorMessage
    };
  }
}

interface ValidationResult {
  valid: boolean;
  error?: string;
}

function validateInputs(projectId: string, spec: CustomObjectSpec): ValidationResult {
  // Check required fields
  if (!projectId) {
    return { valid: false, error: 'projectId is required' };
  }

  if (!spec.fullName) {
    return { valid: false, error: 'fullName is required' };
  }

  if (!spec.label) {
    return { valid: false, error: 'label is required' };
  }

  if (!spec.pluralLabel) {
    return { valid: false, error: 'pluralLabel is required' };
  }

  if (!spec.deploymentStatus) {
    return { valid: false, error: 'deploymentStatus is required' };
  }

  if (!spec.sharingModel) {
    return { valid: false, error: 'sharingModel is required' };
  }

  if (!spec.visibility) {
    return { valid: false, error: 'visibility is required' };
  }

  if (!spec.nameField) {
    return { valid: false, error: 'nameField is required' };
  }

  if (!spec.nameField.label) {
    return { valid: false, error: 'nameField.label is required' };
  }

  if (!spec.nameField.type) {
    return { valid: false, error: 'nameField.type is required' };
  }

  // Validate fullName ends with __c
  if (!spec.fullName.endsWith('__c')) {
    return { valid: false, error: 'fullName must end with __c' };
  }

  // Validate deploymentStatus
  const validDeploymentStatuses = ['Deployed', 'InDevelopment'];
  if (!validDeploymentStatuses.includes(spec.deploymentStatus)) {
    return { valid: false, error: `deploymentStatus must be one of: ${validDeploymentStatuses.join(', ')}` };
  }

  // Validate sharingModel
  const validSharingModels = ['ReadWrite', 'Private', 'ControlledByParent'];
  if (!validSharingModels.includes(spec.sharingModel)) {
    return { valid: false, error: `sharingModel must be one of: ${validSharingModels.join(', ')}` };
  }

  // Validate visibility
  const validVisibilities = ['Public', 'PackageProtected'];
  if (!validVisibilities.includes(spec.visibility)) {
    return { valid: false, error: `visibility must be one of: ${validVisibilities.join(', ')}` };
  }

  // Validate nameField.type
  const validNameFieldTypes = ['Text', 'AutoNumber'];
  if (!validNameFieldTypes.includes(spec.nameField.type)) {
    return { valid: false, error: `nameField.type must be one of: ${validNameFieldTypes.join(', ')}` };
  }

  return { valid: true };
}
