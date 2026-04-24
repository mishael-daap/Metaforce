export interface ProjectSpec {
  projectId: string;              // Folder name (e.g., "my-project" or "[project_id]")
  name?: string;                  // Project name in sfdx-project.json (defaults to projectId)
  apiVersion?: string;             // Salesforce API version (defaults to "66.0")
  namespace?: string;             // Package namespace (defaults to "")
  sfdcLoginUrl?: string;           // Login URL (defaults to "https://login.salesforce.com")
  sourceApiVersion?: string;      // Override sourceApiVersion if different
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
