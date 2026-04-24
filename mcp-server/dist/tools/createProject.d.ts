import { ProjectSpec } from '../types/ProjectSpec.js';
export interface CreateProjectResult {
    success: boolean;
    projectPath?: string;
    error?: string;
}
export declare function createProject(spec: ProjectSpec): Promise<CreateProjectResult>;
//# sourceMappingURL=createProject.d.ts.map