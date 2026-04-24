export interface ProjectSpec {
    projectId: string;
    name?: string;
    apiVersion?: string;
    namespace?: string;
    sfdcLoginUrl?: string;
    sourceApiVersion?: string;
}
export interface SfdxProjectConfig {
    packageDirectories: Array<{
        path: string;
        default: boolean;
    }>;
    name: string;
    namespace: string;
    sfdcLoginUrl: string;
    sourceApiVersion: string;
}
//# sourceMappingURL=ProjectSpec.d.ts.map