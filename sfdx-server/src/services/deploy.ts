import { exec } from 'child_process';
import { promisify } from 'util';
import * as fs from 'fs';
import * as path from 'path';

const execAsync = promisify(exec);

export interface DeployInput {
  projectId: string;
  targetOrg: string;
  dryRun?: boolean;
}

export interface DeployResult {
  success: boolean;
  deploymentId?: string;
  componentSuccesses?: number;
  componentFailures?: number;
  error?: string;
}

export async function deployMetadata(input: DeployInput): Promise<DeployResult> {
  try {
    if (!input.projectId) {
      return { success: false, error: 'projectId is required' };
    }

    if (!input.targetOrg) {
      return { success: false, error: 'targetOrg is required' };
    }

    const projectPath = path.join(process.cwd(), 'projects', input.projectId);
    const forceAppPath = path.join(projectPath, 'force-app');

    if (!fs.existsSync(forceAppPath)) {
      return {
        success: false,
        error: `force-app directory not found in project: ${input.projectId}`
      };
    }

    let command = `sf project deploy start --source-dir force-app --target-org ${input.targetOrg} --json`;

    if (input.dryRun) {
      command += ' --dry-run';
    }

    try {
      const { stdout } = await execAsync(command, {
        env: process.env,
        cwd: projectPath
      });

      const result = JSON.parse(stdout);
      return parseDeployResult(result);
    } catch (execError: any) {
      if (execError.stdout) {
        try {
          const result = JSON.parse(execError.stdout);
          return parseDeployResult(result);
        } catch {
          // Failed to parse JSON
        }
      }

      const errorMessage = execError.message || 'Unknown deployment error';
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

function parseDeployResult(result: any): DeployResult {
  const deployResult = result?.result || result;
  const componentSuccesses = deployResult?.successes?.length || 0;
  const componentFailures = deployResult?.failures?.length || 0;
  const errorMessage = result?.message;

  // Check if status is 0 and no failures
  const success = result?.status === 0 && componentFailures === 0;

  return {
    success,
    deploymentId: deployResult?.id,
    componentSuccesses,
    componentFailures,
    error: success ? undefined : (errorMessage || 'Deployment failed')
  };
}
