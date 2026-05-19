import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export interface DeleteMetadataInput {
  projectId: string;
  metadataType: string;
  fullName: string;
}

export interface DeleteMetadataResult {
  success: boolean;
  error?: string;
}

export async function deleteMetadata(input: DeleteMetadataInput): Promise<DeleteMetadataResult> {
  try {
    if (!input.projectId) {
      return { success: false, error: 'projectId is required' };
    }

    if (!input.metadataType) {
      return { success: false, error: 'metadataType is required' };
    }

    if (!input.fullName) {
      return { success: false, error: 'fullName is required' };
    }

    const projectPath = `${process.cwd()}/projects/${input.projectId}`;
    const command = `sf project delete source --metadata ${input.metadataType}:${input.fullName} --target-org ${input.projectId} --no-prompt --json`;

    try {
      const { stdout } = await execAsync(command, {
        cwd: projectPath
      });

      const result = JSON.parse(stdout);
      if (result.status !== 0) {
        return { success: false, error: result.message || 'Delete failed' };
      }

      return { success: true };
    } catch (execError: any) {
      if (execError.stdout) {
        try {
          const result = JSON.parse(execError.stdout);
          if (result.status === 0) {
            return { success: true };
          }
          return { success: false, error: result.message || 'Delete failed' };
        } catch {
          // Failed to parse JSON
        }
      }

      return { success: false, error: execError.message || 'Unknown delete error' };
    }
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
    return { success: false, error: errorMessage };
  }
}
