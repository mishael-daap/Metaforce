export type DeploymentStatus = 'Deployed' | 'InDevelopment';
export type SharingModel = 'ReadWrite' | 'Private' | 'ControlledByParent';
export type Visibility = 'Public' | 'PackageProtected';
export type NameFieldType = 'Text' | 'AutoNumber';
export interface NameFieldSpec {
    label: string;
    type: NameFieldType;
    displayFormat?: string;
    scale?: number;
    trackHistory?: boolean;
}
export interface CustomObjectSpec {
    fullName: string;
    label: string;
    pluralLabel: string;
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
//# sourceMappingURL=CustomObjectSpec.d.ts.map