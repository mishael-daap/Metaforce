export { createCustomObject } from './generators/createCustomObject.js';
export type { CreateCustomObjectResult } from './generators/createCustomObject.js';
export type { CustomObjectSpec, NameFieldSpec } from './types/CustomObjectSpec.js';

export { createProject } from './generators/createProject.js';
export type { CreateProjectResult } from './generators/createProject.js';
export type { ProjectSpec, SfdxProjectConfig } from './types/ProjectSpec.js';

export { createCustomField } from './generators/createCustomField.js';
export type { CreateCustomFieldResult } from './generators/createCustomField.js';
export type {
  BaseFieldSpec,
  BaseTextFieldSpec,
  TextFieldSpec,
  TextAreaFieldSpec,
  LongTextAreaFieldSpec,
  HtmlFieldSpec,
  EncryptedTextFieldSpec,
  CustomTextFieldSpec,
  TextFieldType,
  NumberFieldSpec,
  CurrencyFieldSpec,
  PercentFieldSpec,
  LocationFieldSpec,
  CustomNumericFieldSpec,
  NumericFieldType,
  CheckboxFieldSpec,
  CustomBooleanFieldSpec,
  BooleanFieldType,
  DateFieldSpec,
  DateTimeFieldSpec,
  TimeFieldSpec,
  CustomDateTimeFieldSpec,
  DateTimeFieldType,
  EmailFieldSpec,
  PhoneFieldSpec,
  UrlFieldSpec,
  CustomCommunicationFieldSpec,
  CommunicationFieldType,
  AutoNumberFieldSpec,
  CustomAutoNumberFieldSpec,
  AutoNumberFieldType,
  LookupFieldSpec,
  MasterDetailFieldSpec,
  CustomRelationshipFieldSpec,
  RelationshipFieldType,
  CustomFieldSpec,
  FieldType
} from './types/CustomFieldSpec.js';
