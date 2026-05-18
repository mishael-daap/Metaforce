export type FieldType =
  | 'Text' | 'TextArea' | 'LongTextArea' | 'Html' | 'EncryptedText'
  | 'Number' | 'Currency' | 'Percent' | 'Location' | 'Checkbox'
  | 'Date' | 'DateTime' | 'Time' | 'Email' | 'Phone' | 'Url'
  | 'AutoNumber' | 'Lookup' | 'MasterDetail' | 'Picklist' | 'MultiselectPicklist'
  | 'Formula' | 'Summary';

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

export type CustomTextFieldSpec = TextFieldSpec | TextAreaFieldSpec | LongTextAreaFieldSpec | HtmlFieldSpec | EncryptedTextFieldSpec;

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

export type CustomNumericFieldSpec = NumberFieldSpec | CurrencyFieldSpec | PercentFieldSpec | LocationFieldSpec;

// Boolean
export interface CheckboxFieldSpec extends BaseFieldSpec {
  type: 'Checkbox';
  defaultValue?: boolean;
}

// Date/Time
export interface DateFieldSpec extends BaseFieldSpec { type: 'Date'; }
export interface DateTimeFieldSpec extends BaseFieldSpec { type: 'DateTime'; }
export interface TimeFieldSpec extends BaseFieldSpec { type: 'Time'; }
export type CustomDateTimeFieldSpec = DateFieldSpec | DateTimeFieldSpec | TimeFieldSpec;

// Communication
export interface EmailFieldSpec extends BaseFieldSpec { type: 'Email';
  externalId?: boolean;
  unique?: boolean;
}
export interface PhoneFieldSpec extends BaseFieldSpec { type: 'Phone'; }
export interface UrlFieldSpec extends BaseFieldSpec { type: 'Url'; }
export type CustomCommunicationFieldSpec = EmailFieldSpec | PhoneFieldSpec | UrlFieldSpec;

// AutoNumber
export interface AutoNumberFieldSpec extends BaseFieldSpec {
  type: 'AutoNumber';
  displayFormat: string;
  externalId?: boolean;
}

// Relationships
export interface LookupFieldSpec extends BaseFieldSpec {
  type: 'Lookup';
  referenceTo: string;
  relationshipName: string;
  relationshipLabel: string;
  deleteConstraint?: 'SetNull' | 'Restrict' | 'Cascade';
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

// Picklist
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

// Formula
export interface FormulaFieldSpec extends BaseFieldSpec {
  type: 'Formula';
  formula: string;
  formulaTreatBlanksAs?: 'BlankAsZero' | 'BlankAsBlank';
  returnType: 'Text' | 'Number' | 'Currency' | 'Percent' | 'Date' | 'DateTime' | 'Checkbox';
  precision?: number;
  scale?: number;
}

// Rollup Summary
export interface RollupSummaryFieldSpec extends BaseFieldSpec {
  type: 'Summary';
  summaryForeignKey: string;
  summaryOperation: 'COUNT' | 'SUM' | 'MIN' | 'MAX';
  summarizedField?: string;
}

// Union of all field types
export type CustomFieldSpec =
  | CustomTextFieldSpec
  | CustomNumericFieldSpec
  | CheckboxFieldSpec
  | CustomDateTimeFieldSpec
  | CustomCommunicationFieldSpec
  | AutoNumberFieldSpec
  | CustomRelationshipFieldSpec
  | CustomPicklistFieldSpec
  | FormulaFieldSpec
  | RollupSummaryFieldSpec;
