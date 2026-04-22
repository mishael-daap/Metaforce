import * as fs from 'fs';
import * as path from 'path';
import { ProjectSpec, SfdxProjectConfig } from '../types/ProjectSpec.js';

export interface CreateProjectResult {
  success: boolean;
  projectPath?: string;
  error?: string;
}

export async function createProject(spec: ProjectSpec): Promise<CreateProjectResult> {
  try {
    // Validate spec
    const validationResult = validateSpec(spec);
    if (!validationResult.valid) {
      return {
        success: false,
        error: validationResult.error
      };
    }

    const projectId = spec.projectId;
    const projectPath = path.join(process.cwd(), projectId);

    // Create project directory
    if (!fs.existsSync(projectPath)) {
      fs.mkdirSync(projectPath, { recursive: true });
    }

    // Create sfdx-project.json
    const sfdxConfig: SfdxProjectConfig = {
      packageDirectories: [
        {
          path: 'force-app',
          default: true
        }
      ],
      name: spec.name || projectId,
      namespace: spec.namespace || '',
      sfdcLoginUrl: spec.sfdcLoginUrl || 'https://login.salesforce.com',
      sourceApiVersion: spec.sourceApiVersion || spec.apiVersion || '66.0'
    };

    const sfdxConfigPath = path.join(projectPath, 'sfdx-project.json');
    fs.writeFileSync(sfdxConfigPath, JSON.stringify(sfdxConfig, null, 2), 'utf-8');

    // Create force-app directory structure
    const forceAppPath = path.join(projectPath, 'force-app');
    const objectsPath = path.join(forceAppPath, 'objects');

    if (!fs.existsSync(objectsPath)) {
      fs.mkdirSync(objectsPath, { recursive: true });
    }

    return {
      success: true,
      projectPath: projectPath
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

function validateSpec(spec: ProjectSpec): ValidationResult {
  // Check required fields
  if (!spec.projectId) {
    return { valid: false, error: 'projectId is required' };
  }

  // Validate projectId doesn't contain invalid characters
  const invalidChars = /[<>:"|?*]/;
  if (invalidChars.test(spec.projectId)) {
    return { valid: false, error: 'projectId contains invalid characters' };
  }

  return { valid: true };
}
