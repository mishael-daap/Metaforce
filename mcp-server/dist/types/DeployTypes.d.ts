export interface DeployMetadataInput {
    projectId: string;
    targetOrg: string;
    dryRun?: boolean;
}
export interface DeployMetadataResult {
    success: boolean;
    deploymentId?: string;
    componentSuccesses?: number;
    componentFailures?: number;
    error?: string;
    [key: string]: unknown;
}
//# sourceMappingURL=DeployTypes.d.ts.map