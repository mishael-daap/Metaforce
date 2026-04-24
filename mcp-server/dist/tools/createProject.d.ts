import type { ProjectSpec } from '../types/ProjectSpec.js';
export interface CreateProjectResult {
    success: boolean;
    projectPath?: string;
    error?: string;
    [key: string]: unknown;
}
export declare function createProject(spec: ProjectSpec): Promise<CreateProjectResult>;
//# sourceMappingURL=createProject.d.ts.map