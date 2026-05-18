import { exec } from 'child_process';
import { promisify } from 'util';
import * as fs from 'fs';
import * as path from 'path';
import type { DeployMetadataInput, DeployMetadataResult } from '../types/DeployTypes.js';

const execAsync = promisify(exec);

export async function deployMetadata(input: DeployMetadataInput): Promise<DeployMetadataResult> {
  try {
    // Validate inputs
    const validationResult = validateInputs(input);
    if (!validationResult.valid) {
      return {
        success: false,
        error: validationResult.error
      };
    }

    const { projectId, targetOrg, dryRun = false } = input;

    // Build project path and verify force-app exists
    const projectPath = path.join(process.cwd(), projectId);
    const forceAppPath = path.join(projectPath, 'force-app');

    if (!fs.existsSync(forceAppPath)) {
      return {
        success: false,
        error: `force-app directory not found in project: ${projectId}`
      };
    }

    // Build CLI command - run from project root, source-dir is relative
    let command = `sf project deploy start --source-dir force-app --target-org ${targetOrg} --json`;

    if (dryRun) {
      command += ' --dry-run';
    }

    try {
      const { stdout } = await execAsync(command, {
        env: process.env,
        cwd: projectPath  // Run from project directory where sfdx-project.json is located
      });

      // Parse JSON output
      const result = JSON.parse(stdout);
      return parseDeployResult(result);
    } catch (execError: any) {
      // CLI may return non-zero exit code but still output JSON
      const stdout = execError.stdout;
      if (stdout) {
        try {
          const result = JSON.parse(stdout);
          return parseDeployResult(result);
        } catch {
          // Failed to parse JSON
        }
      }

      // Return the error message from exec
      const errorMessage = execError.message || 'Unknown error occurred';
      return {
        success: false,
        error: errorMessage
      };
    }
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
    return {
      success: false,
      error: errorMessage
    };
  }
}

function parseDeployResult(result: any): DeployMetadataResult {
  const deployResult = result?.result || {};
  const componentSuccesses = deployResult.successes?.length || 0;
  const componentFailures = deployResult.failures?.length || 0;
  const errorMessage = result?.message;

  // Success if status is 0 and no failures
  const success = result?.status === 0 && componentFailures === 0;

  return {
    success,
    deploymentId: deployResult.id,
    componentSuccesses,
    componentFailures,
    error: success ? undefined : (errorMessage || 'Deployment failed')
  };
}

interface ValidationResult {
  valid: boolean;
  error?: string;
}

function validateInputs(input: DeployMetadataInput): ValidationResult {
  if (!input.projectId) {
    return { valid: false, error: 'projectId is required' };
  }

  if (!input.targetOrg) {
    return { valid: false, error: 'targetOrg is required' };
  }

  return { valid: true };
}
