import * as fs from 'fs';
import * as path from 'path';
export async function createProject(spec) {
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
        fs.mkdirSync(objectsPath, { recursive: true });
        return {
            success: true,
            projectPath: projectPath
        };
    }
    catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
        return {
            success: false,
            error: errorMessage
        };
    }
}
function validateSpec(spec) {
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
//# sourceMappingURL=createProject.js.map