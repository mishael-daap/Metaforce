export type TextFieldType = 'Text' | 'TextArea' | 'LongTextArea' | 'Html' | 'EncryptedText';
export type NumericFieldType = 'Number' | 'Currency' | 'Percent' | 'Location';
export type BooleanFieldType = 'Checkbox';
export type DateTimeFieldType = 'Date' | 'DateTime' | 'Time';
export type CommunicationFieldType = 'Email' | 'Phone' | 'Url';
export type AutoNumberFieldType = 'AutoNumber';
export type RelationshipFieldType = 'Lookup' | 'MasterDetail';
export type PicklistFieldType = 'Picklist' | 'MultiselectPicklist';
export type FormulaFieldType = 'Formula';
export type RollupSummaryFieldType = 'Summary';
export type FieldType = TextFieldType | NumericFieldType | BooleanFieldType | DateTimeFieldType | CommunicationFieldType | AutoNumberFieldType | RelationshipFieldType | PicklistFieldType | FormulaFieldType | RollupSummaryFieldType;

export interface BaseFieldSpec {
  fullName: string;
  label: string;
  type: FieldType;
  description?: string;
  inlineHelpText?: string;
  required?: boolean;
  trackHistory?: boolean;
  trackTrending?: boolean;
}

// For backwards compatibility
export type BaseTextFieldSpec = BaseFieldSpec;

// Text Field Types
export interface TextFieldSpec extends BaseFieldSpec {
  type: 'Text';
  length?: number;
  externalId?: boolean;
  unique?: boolean;
}

export interface TextAreaFieldSpec extends BaseFieldSpec {
  type: 'TextArea';
}

export interface LongTextAreaFieldSpec extends BaseFieldSpec {
  type: 'LongTextArea';
  length?: number;
  visibleLines: number;
}

export interface HtmlFieldSpec extends BaseFieldSpec {
  type: 'Html';
  length?: number;
  visibleLines: number;
}

export interface EncryptedTextFieldSpec extends BaseFieldSpec {
  type: 'EncryptedText';
  length: number;
  maskChar: 'asterisk' | 'X';
  maskType: 'all' | 'lastFour' | 'creditCard' | 'sin' | 'socialSecurityNumber' | 'nino';
  externalId?: boolean;
}

export type CustomTextFieldSpec =
  | TextFieldSpec
  | TextAreaFieldSpec
  | LongTextAreaFieldSpec
  | HtmlFieldSpec
  | EncryptedTextFieldSpec;

// Numeric Field Types
export interface NumberFieldSpec extends BaseFieldSpec {
  type: 'Number';
  precision: number;
  scale: number;
  externalId?: boolean;
  unique?: boolean;
}

export interface CurrencyFieldSpec extends BaseFieldSpec {
  type: 'Currency';
  precision: number;
  scale: number;
}

export interface PercentFieldSpec extends BaseFieldSpec {
  type: 'Percent';
  precision: number;
  scale: number;
}

export interface LocationFieldSpec extends BaseFieldSpec {
  type: 'Location';
  displayLocationInDecimal?: boolean;
  scale?: number;
}

export type CustomNumericFieldSpec =
  | NumberFieldSpec
  | CurrencyFieldSpec
  | PercentFieldSpec
  | LocationFieldSpec;

// Boolean Field Types
export interface CheckboxFieldSpec extends BaseFieldSpec {
  type: 'Checkbox';
  defaultValue?: boolean;
}

export type CustomBooleanFieldSpec = CheckboxFieldSpec;

// DateTime Field Types
export interface DateFieldSpec extends BaseFieldSpec {
  type: 'Date';
}

export interface DateTimeFieldSpec extends BaseFieldSpec {
  type: 'DateTime';
}

export interface TimeFieldSpec extends BaseFieldSpec {
  type: 'Time';
}

export type CustomDateTimeFieldSpec = DateFieldSpec | DateTimeFieldSpec | TimeFieldSpec;

// Communication Field Types
export interface EmailFieldSpec extends BaseFieldSpec {
  type: 'Email';
  externalId?: boolean;
  unique?: boolean;
}

export interface PhoneFieldSpec extends BaseFieldSpec {
  type: 'Phone';
}

export interface UrlFieldSpec extends BaseFieldSpec {
  type: 'Url';
}

export type CustomCommunicationFieldSpec = EmailFieldSpec | PhoneFieldSpec | UrlFieldSpec;

// AutoNumber Field Type
export interface AutoNumberFieldSpec extends BaseFieldSpec {
  type: 'AutoNumber';
  displayFormat: string;
  externalId?: boolean;
}

export type CustomAutoNumberFieldSpec = AutoNumberFieldSpec;

// Relationship Field Types
export interface LookupFieldSpec extends BaseFieldSpec {
  type: 'Lookup';
  referenceTo: string;
  relationshipName: string;
  relationshipLabel: string;
  deleteConstraint?: 'SetNull' | 'Restrict' | 'Cascade';
  required?: boolean;
}

export interface MasterDetailFieldSpec extends BaseFieldSpec {
  type: 'MasterDetail';
  referenceTo: string;
  relationshipName: string;
  relationshipLabel: string;
  relationshipOrder: number;
  reparentableMasterDetail?: boolean;
  writeRequiresMasterRead?: boolean;
}

export type CustomRelationshipFieldSpec = LookupFieldSpec | MasterDetailFieldSpec;

// Picklist Field Types
export interface PicklistValue {
  fullName: string;
  label: string;
  default?: boolean;
}

export interface PicklistValueSet {
  restricted?: boolean;
  sorted?: boolean;
  values: PicklistValue[];
}

export interface PicklistFieldSpec extends BaseFieldSpec {
  type: 'Picklist';
  valueSet: PicklistValueSet;
}

export interface MultiselectPicklistFieldSpec extends BaseFieldSpec {
  type: 'MultiselectPicklist';
  visibleLines: number;
  valueSet: PicklistValueSet;
}

export type CustomPicklistFieldSpec = PicklistFieldSpec | MultiselectPicklistFieldSpec;

// Formula Field Type
export interface FormulaFieldSpec extends BaseFieldSpec {
  type: 'Formula';
  formula: string;
  formulaTreatBlanksAs?: 'BlankAsZero' | 'BlankAsBlank';
  returnType: 'Text' | 'Number' | 'Currency' | 'Percent' | 'Date' | 'DateTime' | 'Checkbox';
  precision?: number;
  scale?: number;
}

export type CustomFormulaFieldSpec = FormulaFieldSpec;

// RollupSummary Field Type
export interface RollupSummaryFieldSpec extends BaseFieldSpec {
  type: 'Summary';
  summaryForeignKey: string;  // Format: ChildObject__c.MasterDetailField__c
  summaryOperation: 'COUNT' | 'SUM' | 'MIN' | 'MAX';
  summarizedField?: string;   // Required for SUM, MIN, MAX
}

export type CustomRollupSummaryFieldSpec = RollupSummaryFieldSpec;

// Union of all field types
export type CustomFieldSpec =
  | CustomTextFieldSpec
  | CustomNumericFieldSpec
  | CustomBooleanFieldSpec
  | CustomDateTimeFieldSpec
  | CustomCommunicationFieldSpec
  | CustomAutoNumberFieldSpec
  | CustomRelationshipFieldSpec
  | CustomPicklistFieldSpec
  | CustomFormulaFieldSpec
  | CustomRollupSummaryFieldSpec;
