import type { CustomFieldSpec } from '../types/CustomFieldSpec.js';
export interface CreateCustomFieldResult {
    success: boolean;
    outputPath?: string;
    error?: string;
    [key: string]: unknown;
}
export declare function createCustomField(projectId: string, objectName: string, spec: CustomFieldSpec): Promise<CreateCustomFieldResult>;
//# sourceMappingURL=createCustomField.d.ts.map