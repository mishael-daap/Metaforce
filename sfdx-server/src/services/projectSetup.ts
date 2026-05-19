import * as fs from 'fs';
import * as path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export interface ProjectSetupInput {
  projectId: string;
  orgUrl: string;
  accessToken: string;
  apiVersion?: string;
}

export interface ProjectSetupResult {
  success: boolean;
  projectPath?: string;
  error?: string;
}

/**
 * Ensures an SFDX project exists for the given projectId.
 * If not, creates the directory, sfdx-project.json, force-app structure,
 * and authenticates the org via Salesforce CLI.
 */
export async function ensureProjectExists(input: ProjectSetupInput): Promise<ProjectSetupResult> {
  try {
    const { projectId, orgUrl, accessToken, apiVersion = '66.0' } = input;
    const projectPath = path.join(process.cwd(), 'projects', projectId);

    // Check if project already exists (lazy init)
    if (fs.existsSync(projectPath)) {
      return {
        success: true,
        projectPath
      };
    }

    // Validate inputs
    if (!projectId) {
      return { success: false, error: 'projectId is required' };
    }
    if (!orgUrl) {
      return { success: false, error: 'orgUrl is required' };
    }
    if (!accessToken) {
      return { success: false, error: 'accessToken is required' };
    }

    // Basic URL validation
    try {
      console.log("the org url from the project set up function", orgUrl)
      new URL(orgUrl);
    } catch {
      return { success: false, error: 'orgUrl must be a valid URL' };
    }

    // Validate Salesforce URL
    if (!orgUrl.includes('.salesforce.com') && !orgUrl.includes('.my.salesforce.com')) {
      return { success: false, error: 'orgUrl must be a valid Salesforce URL' };
    }

    // Create project directory
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
      sfdcLoginUrl: orgUrl,
      sourceApiVersion: apiVersion
    };

    fs.writeFileSync(
      path.join(projectPath, 'sfdx-project.json'),
      JSON.stringify(sfdxConfig, null, 2),
      'utf-8'
    );

    // Create force-app directory structure
    const objectsPath = path.join(projectPath, 'force-app', 'objects');
    fs.mkdirSync(objectsPath, { recursive: true });

    // Create manifest directory and package.xml
const manifestPath = path.join(projectPath, 'manifest');
fs.mkdirSync(manifestPath, { recursive: true });

fs.writeFileSync(
  path.join(manifestPath, 'package.xml'),
  `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Package xmlns="http://soap.sforce.com/2006/04/metadata">
    <types>
        <members>*</members>
        <name>CustomObject</name>
    </types>
</Package>`,
  'utf-8'
);

    // Authenticate with Salesforce CLI
    const command = `sf org login access-token --instance-url ${orgUrl} --alias ${projectId} --no-prompt --json`;

    try {
      const { stdout } = await execAsync(command, {
        env: { ...process.env, SF_ACCESS_TOKEN: accessToken },
        cwd: projectPath
      });

      const result = JSON.parse(stdout);
      if (result.status !== 0) {
        return {
          success: false,
          error: result.message || 'Authentication failed'
        };
      }
    } catch (authError: any) {
      // Try to parse stdout for the JSON result
      if (authError.stdout) {
        try {
          const result = JSON.parse(authError.stdout);
          if (result.result && result.result.username) {
            // Successful auth with non-zero exit code (common with sf CLI)
            return {
              success: true,
              projectPath
            };
          }
          if (result.message) {
            return {
              success: false,
              error: result.message
            };
          }
        } catch {
          // Could not parse, use the exec error
        }
      }

      const errorMessage = authError.message || 'Unknown authentication error';
      return {
        success: false,
        error: `Failed to authenticate with Salesforce: ${errorMessage}`
      };
    }

    return {
      success: true,
      projectPath
    };
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred during project setup';
    return {
      success: false,
      error: errorMessage
    };
  }
}
