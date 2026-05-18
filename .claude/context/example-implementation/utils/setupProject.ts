import * as fs from 'fs';
import * as path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export interface SetupProjectInput {
  alias: string;
  instanceUrl: string;
  accessToken: string;
  apiVersion?: string;
}

export interface SetupProjectResult {
  success: boolean;
  projectPath?: string;
  error?: string;
}

export async function setupProject(input: SetupProjectInput): Promise<SetupProjectResult> {
  try {
    // Validate inputs
    const validationResult = validateInputs(input);
    if (!validationResult.valid) {
      return {
        success: false,
        error: validationResult.error
      };
    }

    const { alias, instanceUrl, accessToken, apiVersion = '66.0' } = input;
    const projectId = alias;
    const projectPath = path.join(process.cwd(), projectId);

    // Create project directory (overwrite if exists)
    if (fs.existsSync(projectPath)) {
      fs.rmSync(projectPath, { recursive: true, force: true });
    }
    fs.mkdirSync(projectPath, { recursive: true });

    // Create sfdx-project.json
    const sfdxConfig = {
      packageDirectories: [
        {
          path: 'force-app',
          default: true
        }
      ],
      name: projectId,
      namespace: '',
      sfdcLoginUrl: instanceUrl,
      sourceApiVersion: apiVersion
    };

    const sfdxConfigPath = path.join(projectPath, 'sfdx-project.json');
    fs.writeFileSync(sfdxConfigPath, JSON.stringify(sfdxConfig, null, 2), 'utf-8');

    // Create force-app directory structure
    const forceAppPath = path.join(projectPath, 'force-app');
    const objectsPath = path.join(forceAppPath, 'objects');
    fs.mkdirSync(objectsPath, { recursive: true });

    // Authenticate org
    const command = `sf org login access-token --instance-url ${instanceUrl} --alias ${alias} --no-prompt --json`;
    const { stdout } = await execAsync(command, {
      env: { ...process.env, SF_ACCESS_TOKEN: accessToken },
      cwd: process.cwd()
    });

    const result = JSON.parse(stdout);
    if (result.status !== 0) {
      return {
        success: false,
        error: result.message || 'Authentication failed'
      };
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

function validateInputs(input: SetupProjectInput): ValidationResult {
  if (!input.alias) {
    return { valid: false, error: 'alias is required' };
  }

  if (!input.instanceUrl) {
    return { valid: false, error: 'instanceUrl is required' };
  }

  if (!input.accessToken) {
    return { valid: false, error: 'accessToken is required' };
  }

  // Basic URL validation
  try {
    new URL(input.instanceUrl);
  } catch {
    return { valid: false, error: 'instanceUrl must be a valid URL' };
  }

  // Validate Salesforce URL
  if (!input.instanceUrl.includes('.salesforce.com') && !input.instanceUrl.includes('.my.salesforce.com')) {
    return { valid: false, error: 'instanceUrl must be a valid Salesforce URL' };
  }

  return { valid: true };
}
