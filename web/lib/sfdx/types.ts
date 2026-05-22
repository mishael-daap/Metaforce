// -------------------------------------------------------
// Enums
// -------------------------------------------------------

export type FieldType =
  | 'Text'
  | 'TextArea'
  | 'LongTextArea'
  | 'Number'
  | 'Currency'
  | 'Checkbox'
  | 'Date'
  | 'DateTime'
  | 'Email'
  | 'Phone'
  | 'Url'
  | 'Picklist'
  | 'Lookup';

export type SharingModel = 'ReadWrite' | 'Private' | 'ControlledByParent';
export type Visibility = 'Public' | 'PackageProtected';
export type DeploymentStatus = 'Deployed' | 'InDevelopment';
export type NameFieldType = 'Text' | 'AutoNumber';

// -------------------------------------------------------
// Name Field
// -------------------------------------------------------

export interface NameFieldSpec {
  label: string;
  type: NameFieldType;
  displayFormat?: string; // required when type is AutoNumber
  trackHistory?: boolean;
}

// -------------------------------------------------------
// Picklist
// -------------------------------------------------------

export interface PicklistValue {
  fullName: string;
  label: string;
  default?: boolean;
}

export interface ValueSet {
  restricted?: boolean;
  sorted?: boolean;
  values: PicklistValue[];
}

// -------------------------------------------------------
// Field Spec
// -------------------------------------------------------

export interface FieldSpec {
  fullName: string;          // must end in __c
  label: string;
  type: FieldType;
  description?: string;
  inlineHelpText?: string;
  required?: boolean;
  trackHistory?: boolean;

  // Text / LongTextArea
  length?: number;

  // Number / Currency
  precision?: number;
  scale?: number;

  // LongTextArea
  visibleLines?: number;

  // Checkbox
  defaultValue?: boolean;

  // Lookup
  referenceTo?: string;
  relationshipName?: string;
  relationshipLabel?: string;
  deleteConstraint?: 'SetNull' | 'Restrict' | 'Cascade';

  // Picklist
  valueSet?: ValueSet;
}

// -------------------------------------------------------
// Object Spec
// -------------------------------------------------------

export interface ObjectSpec {
  fullName: string;           // must end in __c
  label: string;
  pluralLabel: string;
  description?: string;
  deploymentStatus?: DeploymentStatus;
  sharingModel: SharingModel;
  visibility: Visibility;
  nameField: NameFieldSpec;
  allowInChatterGroups?: boolean;
  enableActivities?: boolean;
  enableBulkApi?: boolean;
  enableFeeds?: boolean;
  enableHistory?: boolean;
  enableReports?: boolean;
  enableSearch?: boolean;
  enableSharing?: boolean;
  enableStreamingApi?: boolean;
}

// -------------------------------------------------------
// API Response
// -------------------------------------------------------

export interface SfdxComponent {
  fullName: string;
  type: string;
  xml?: string;
}

export interface ObjectDetail {
  apiName: string;
  xml: string;
  fields: SfdxComponent[];
}

export interface SfdxResponse {
  success: boolean;
  error: string | null;
  components: SfdxComponent[];
  detail?: ObjectDetail;
}

// -------------------------------------------------------
// Factory Config
// -------------------------------------------------------

export interface SfdxClientConfig {
  baseUrl: string;
  apiKey: string;
  projectId: string;
  accessToken: string;
  orgUrl: string;
}
