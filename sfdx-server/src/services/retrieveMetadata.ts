import path from "path";
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export async function retrieveMetadata(projectId: string): Promise<{ success: boolean; error?: string }> {
  const projectPath = path.join(process.cwd(), 'projects', projectId);
  const command = `sf project retrieve start --manifest manifest/package.xml --target-org ${projectId} --json`;
  
  try {
    const { stdout } = await execAsync(command, { cwd: projectPath });
    const result = JSON.parse(stdout);
    if (result.status !== 0) {
      return { success: false, error: result.message || 'Retrieve failed' };
    }
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}