export type DeploymentStatus = 'Deployed' | 'InDevelopment';
export type SharingModel = 'ReadWrite' | 'Private' | 'ControlledByParent';
export type Visibility = 'Public' | 'PackageProtected';
export type NameFieldType = 'Text' | 'AutoNumber';

export interface NameFieldSpec {
  label: string;
  type: NameFieldType;
  displayFormat?: string;      // For AutoNumber (e.g., "MO-{0000}")
  scale?: number;               // For AutoNumber
  trackHistory?: boolean;
}

export interface CustomObjectSpec {
  fullName: string;             // e.g., "MyObject__c"
  label: string;                // e.g., "My Object"
  pluralLabel: string;          // e.g., "My Objects"
  description?: string;
  deploymentStatus: DeploymentStatus;
  sharingModel: SharingModel;
  externalSharingModel?: string;
  allowInChatterGroups?: boolean;
  enableActivities?: boolean;
  enableBulkApi?: boolean;
  enableFeeds?: boolean;
  enableHistory?: boolean;
  enableReports?: boolean;
  enableSearch?: boolean;
  enableSharing?: boolean;
  enableStreamingApi?: boolean;
  visibility: Visibility;
  compactLayoutAssignment?: string;
  nameField: NameFieldSpec;
}
