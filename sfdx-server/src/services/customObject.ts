import * as fs from 'fs';
import * as path from 'path';
import type { CustomObjectSpec } from '../types/CustomObjectSpec.js';
import { buildCustomObjectXml } from '../xml/builders/customObjectBuilder.js';

export interface CustomObjectResult {
  success: boolean;
  outputPath?: string;
  xml?: string;
  error?: string;
}

export interface Component {
  fullName: string;
  type: string;
  xml: string;
}

export async function createCustomObject(
  projectId: string,
  spec: CustomObjectSpec
): Promise<CustomObjectResult> {
  try {
    // Default deploymentStatus to Deployed if not provided
    spec = { ...spec, deploymentStatus: spec.deploymentStatus || 'Deployed' };

    const validationResult = validateInputs(projectId, spec);
    if (!validationResult.valid) {
      return {
        success: false,
        error: validationResult.error
      };
    }

    const objectName = spec.fullName;
    const projectPath = path.join(process.cwd(), 'projects', projectId);
    const outputDir = path.join(projectPath, 'force-app', 'objects', objectName);

    if (!fs.existsSync(projectPath)) {
      return {
        success: false,
        error: `Project '${projectId}' does not exist. Project must be initialized before creating metadata.`
      };
    }

    // Remove existing dir if it exists (overwrite)
    if (fs.existsSync(outputDir)) {
      fs.rmSync(outputDir, { recursive: true, force: true });
    }
    fs.mkdirSync(outputDir, { recursive: true });

    const xmlContent = buildCustomObjectXml(spec);
    const xmlFileName = `${objectName}.object-meta.xml`;
    const xmlFilePath = path.join(outputDir, xmlFileName);
    fs.writeFileSync(xmlFilePath, xmlContent, 'utf-8');

    return {
      success: true,
      xml: xmlContent
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
  if (!projectId) {
    return { valid: false, error: 'projectId is required' };
  }

  if (!spec.fullName) {
    return { valid: false, error: 'fullName is required' };
  }

  if (!spec.fullName.endsWith('__c')) {
    return { valid: false, error: 'fullName must end with __c' };
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

  const validDeploymentStatuses = ['Deployed', 'InDevelopment'];
  if (!validDeploymentStatuses.includes(spec.deploymentStatus)) {
    return { valid: false, error: `deploymentStatus must be one of: ${validDeploymentStatuses.join(', ')}` };
  }

  const validSharingModels = ['ReadWrite', 'Private', 'ControlledByParent'];
  if (!validSharingModels.includes(spec.sharingModel)) {
    return { valid: false, error: `sharingModel must be one of: ${validSharingModels.join(', ')}` };
  }

  const validVisibilities = ['Public', 'PackageProtected'];
  if (!validVisibilities.includes(spec.visibility)) {
    return { valid: false, error: `visibility must be one of: ${validVisibilities.join(', ')}` };
  }

  const validNameFieldTypes = ['Text', 'AutoNumber'];
  if (!validNameFieldTypes.includes(spec.nameField.type)) {
    return { valid: false, error: `nameField.type must be one of: ${validNameFieldTypes.join(', ')}` };
  }

  return { valid: true };
}
