import type { CustomObjectSpec } from '../types/CustomObjectSpec.js';
export interface CreateCustomObjectResult {
    success: boolean;
    outputPath?: string;
    error?: string;
    [key: string]: unknown;
}
export declare function createCustomObject(projectId: string, spec: CustomObjectSpec): Promise<CreateCustomObjectResult>;
//# sourceMappingURL=createCustomObject.d.ts.map