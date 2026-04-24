import type {
  CustomFieldSpec,
  TextFieldSpec,
  TextAreaFieldSpec,
  LongTextAreaFieldSpec,
  HtmlFieldSpec,
  EncryptedTextFieldSpec,
  NumberFieldSpec,
  CurrencyFieldSpec,
  PercentFieldSpec,
  LocationFieldSpec,
  CheckboxFieldSpec,
  DateFieldSpec,
  DateTimeFieldSpec,
  TimeFieldSpec,
  EmailFieldSpec,
  PhoneFieldSpec,
  UrlFieldSpec,
  AutoNumberFieldSpec,
  LookupFieldSpec,
  MasterDetailFieldSpec,
  PicklistFieldSpec,
  MultiselectPicklistFieldSpec,
  FormulaFieldSpec,
  RollupSummaryFieldSpec
} from '../../types/CustomFieldSpec.js';

const XML_NAMESPACE = 'http://soap.sforce.com/2006/04/metadata';

export function buildCustomFieldXml(spec: CustomFieldSpec): string {
  const lines: string[] = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    `<CustomField xmlns="${XML_NAMESPACE}">`
  ];

  // fullName (required)
  lines.push(`    <fullName>${escapeXml(spec.fullName)}</fullName>`);

  // Common optional fields
  if (spec.description) {
    lines.push(`    <description>${escapeXml(spec.description)}</description>`);
  }

  if (spec.inlineHelpText) {
    lines.push(`    <inlineHelpText>${escapeXml(spec.inlineHelpText)}</inlineHelpText>`);
  }

  // label (required)
  lines.push(`    <label>${escapeXml(spec.label)}</label>`);

  // trackHistory (optional) - not supported for Summary fields
  if (spec.trackHistory !== undefined && spec.type !== 'Summary') {
    lines.push(`    <trackHistory>${spec.trackHistory ? 'true' : 'false'}</trackHistory>`);
  }

  // trackTrending (optional) - not supported for Summary fields
  if (spec.trackTrending !== undefined && spec.type !== 'Summary') {
    lines.push(`    <trackTrending>${spec.trackTrending ? 'true' : 'false'}</trackTrending>`);
  }

  // Type-specific fields
  switch (spec.type) {
    case 'Text':
      lines.push(...buildTextFieldXml(spec));
      break;
    case 'TextArea':
      lines.push(...buildTextAreaFieldXml(spec));
      break;
    case 'LongTextArea':
      lines.push(...buildLongTextAreaFieldXml(spec));
      break;
    case 'Html':
      lines.push(...buildHtmlFieldXml(spec));
      break;
    case 'EncryptedText':
      lines.push(...buildEncryptedTextFieldXml(spec));
      break;
    case 'Number':
      lines.push(...buildNumberFieldXml(spec));
      break;
    case 'Currency':
      lines.push(...buildCurrencyFieldXml(spec));
      break;
    case 'Percent':
      lines.push(...buildPercentFieldXml(spec));
      break;
    case 'Location':
      lines.push(...buildLocationFieldXml(spec));
      break;
    case 'Checkbox':
      lines.push(...buildCheckboxFieldXml(spec));
      break;
    case 'Date':
      lines.push(...buildDateFieldXml(spec));
      break;
    case 'DateTime':
      lines.push(...buildDateTimeFieldXml(spec));
      break;
    case 'Time':
      lines.push(...buildTimeFieldXml(spec));
      break;
    case 'Email':
      lines.push(...buildEmailFieldXml(spec));
      break;
    case 'Phone':
      lines.push(...buildPhoneFieldXml(spec));
      break;
    case 'Url':
      lines.push(...buildUrlFieldXml(spec));
      break;
    case 'AutoNumber':
      lines.push(...buildAutoNumberFieldXml(spec));
      break;
    case 'Lookup':
      lines.push(...buildLookupFieldXml(spec));
      break;
    case 'MasterDetail':
      lines.push(...buildMasterDetailFieldXml(spec));
      break;
    case 'Picklist':
      lines.push(...buildPicklistFieldXml(spec));
      break;
    case 'MultiselectPicklist':
      lines.push(...buildMultiselectPicklistFieldXml(spec));
      break;
    case 'Formula':
      lines.push(...buildFormulaFieldXml(spec));
      break;
    case 'Summary':
      lines.push(...buildRollupSummaryFieldXml(spec));
      break;
  }

  lines.push('</CustomField>');

  return lines.join('\n');
}

function buildTextFieldXml(spec: TextFieldSpec): string[] {
  const lines: string[] = [];

  if (spec.externalId !== undefined) {
    lines.push(`    <externalId>${spec.externalId ? 'true' : 'false'}</externalId>`);
  }

  if (spec.length !== undefined) {
    lines.push(`    <length>${spec.length}</length>`);
  }

  if (spec.required !== undefined) {
    lines.push(`    <required>${spec.required ? 'true' : 'false'}</required>`);
  }

  lines.push(`    <type>Text</type>`);

  if (spec.unique !== undefined) {
    lines.push(`    <unique>${spec.unique ? 'true' : 'false'}</unique>`);
  }

  return lines;
}

function buildTextAreaFieldXml(spec: TextAreaFieldSpec): string[] {
  const lines: string[] = [];

  if (spec.required !== undefined) {
    lines.push(`    <required>${spec.required ? 'true' : 'false'}</required>`);
  }

  lines.push(`    <type>TextArea</type>`);

  return lines;
}

function buildLongTextAreaFieldXml(spec: LongTextAreaFieldSpec): string[] {
  const lines: string[] = [];

  if (spec.length !== undefined) {
    lines.push(`    <length>${spec.length}</length>`);
  }

  if (spec.required !== undefined) {
    lines.push(`    <required>${spec.required ? 'true' : 'false'}</required>`);
  }

  lines.push(`    <type>LongTextArea</type>`);
  lines.push(`    <visibleLines>${spec.visibleLines}</visibleLines>`);

  return lines;
}

function buildHtmlFieldXml(spec: HtmlFieldSpec): string[] {
  const lines: string[] = [];

  if (spec.length !== undefined) {
    lines.push(`    <length>${spec.length}</length>`);
  }

  if (spec.required !== undefined) {
    lines.push(`    <required>${spec.required ? 'true' : 'false'}</required>`);
  }

  lines.push(`    <type>Html</type>`);
  lines.push(`    <visibleLines>${spec.visibleLines}</visibleLines>`);

  return lines;
}

function buildEncryptedTextFieldXml(spec: EncryptedTextFieldSpec): string[] {
  const lines: string[] = [];

  if (spec.externalId !== undefined) {
    lines.push(`    <externalId>${spec.externalId ? 'true' : 'false'}</externalId>`);
  }

  lines.push(`    <length>${spec.length}</length>`);
  lines.push(`    <maskChar>${spec.maskChar}</maskChar>`);
  lines.push(`    <maskType>${spec.maskType}</maskType>`);

  if (spec.required !== undefined) {
    lines.push(`    <required>${spec.required ? 'true' : 'false'}</required>`);
  }

  lines.push(`    <type>EncryptedText</type>`);

  return lines;
}

function buildNumberFieldXml(spec: NumberFieldSpec): string[] {
  const lines: string[] = [];

  if (spec.externalId !== undefined) {
    lines.push(`    <externalId>${spec.externalId ? 'true' : 'false'}</externalId>`);
  }

  lines.push(`    <precision>${spec.precision}</precision>`);

  if (spec.required !== undefined) {
    lines.push(`    <required>${spec.required ? 'true' : 'false'}</required>`);
  }

  lines.push(`    <scale>${spec.scale}</scale>`);
  lines.push(`    <type>Number</type>`);

  if (spec.unique !== undefined) {
    lines.push(`    <unique>${spec.unique ? 'true' : 'false'}</unique>`);
  }

  return lines;
}

function buildCurrencyFieldXml(spec: CurrencyFieldSpec): string[] {
  const lines: string[] = [];

  lines.push(`    <precision>${spec.precision}</precision>`);

  if (spec.required !== undefined) {
    lines.push(`    <required>${spec.required ? 'true' : 'false'}</required>`);
  }

  lines.push(`    <scale>${spec.scale}</scale>`);
  lines.push(`    <type>Currency</type>`);

  return lines;
}

function buildPercentFieldXml(spec: PercentFieldSpec): string[] {
  const lines: string[] = [];

  lines.push(`    <precision>${spec.precision}</precision>`);

  if (spec.required !== undefined) {
    lines.push(`    <required>${spec.required ? 'true' : 'false'}</required>`);
  }

  lines.push(`    <scale>${spec.scale}</scale>`);
  lines.push(`    <type>Percent</type>`);

  return lines;
}

function buildLocationFieldXml(spec: LocationFieldSpec): string[] {
  const lines: string[] = [];

  if (spec.displayLocationInDecimal !== undefined) {
    lines.push(`    <displayLocationInDecimal>${spec.displayLocationInDecimal ? 'true' : 'false'}</displayLocationInDecimal>`);
  }

  if (spec.required !== undefined) {
    lines.push(`    <required>${spec.required ? 'true' : 'false'}</required>`);
  }

  if (spec.scale !== undefined) {
    lines.push(`    <scale>${spec.scale}</scale>`);
  }

  lines.push(`    <type>Location</type>`);

  return lines;
}

function buildCheckboxFieldXml(spec: CheckboxFieldSpec): string[] {
  const lines: string[] = [];

  // defaultValue is required for Checkbox fields in Salesforce
  lines.push(`    <defaultValue>${spec.defaultValue ? 'true' : 'false'}</defaultValue>`);

  lines.push(`    <type>Checkbox</type>`);

  return lines;
}

function buildEmailFieldXml(spec: EmailFieldSpec): string[] {
  const lines: string[] = [];

  if (spec.externalId !== undefined) {
    lines.push(`    <externalId>${spec.externalId ? 'true' : 'false'}</externalId>`);
  }

  if (spec.required !== undefined) {
    lines.push(`    <required>${spec.required ? 'true' : 'false'}</required>`);
  }

  lines.push(`    <type>Email</type>`);

  if (spec.unique !== undefined) {
    lines.push(`    <unique>${spec.unique ? 'true' : 'false'}</unique>`);
  }

  return lines;
}

function buildPhoneFieldXml(spec: PhoneFieldSpec): string[] {
  const lines: string[] = [];

  if (spec.required !== undefined) {
    lines.push(`    <required>${spec.required ? 'true' : 'false'}</required>`);
  }

  lines.push(`    <type>Phone</type>`);

  return lines;
}

function buildUrlFieldXml(spec: UrlFieldSpec): string[] {
  const lines: string[] = [];

  if (spec.required !== undefined) {
    lines.push(`    <required>${spec.required ? 'true' : 'false'}</required>`);
  }

  lines.push(`    <type>Url</type>`);

  return lines;
}

function buildAutoNumberFieldXml(spec: AutoNumberFieldSpec): string[] {
  const lines: string[] = [];

  lines.push(`    <displayFormat>${escapeXml(spec.displayFormat)}</displayFormat>`);

  if (spec.externalId !== undefined) {
    lines.push(`    <externalId>${spec.externalId ? 'true' : 'false'}</externalId>`);
  }

  lines.push(`    <type>AutoNumber</type>`);

  return lines;
}

function buildDateFieldXml(spec: DateFieldSpec): string[] {
  const lines: string[] = [];

  if (spec.required !== undefined) {
    lines.push(`    <required>${spec.required ? 'true' : 'false'}</required>`);
  }

  lines.push(`    <type>Date</type>`);

  return lines;
}

function buildDateTimeFieldXml(spec: DateTimeFieldSpec): string[] {
  const lines: string[] = [];

  if (spec.required !== undefined) {
    lines.push(`    <required>${spec.required ? 'true' : 'false'}</required>`);
  }

  lines.push(`    <type>DateTime</type>`);

  return lines;
}

function buildTimeFieldXml(spec: TimeFieldSpec): string[] {
  const lines: string[] = [];

  if (spec.required !== undefined) {
    lines.push(`    <required>${spec.required ? 'true' : 'false'}</required>`);
  }

  lines.push(`    <type>Time</type>`);

  return lines;
}

function buildLookupFieldXml(spec: LookupFieldSpec): string[] {
  const lines: string[] = [];

  lines.push(`    <deleteConstraint>${spec.deleteConstraint || 'SetNull'}</deleteConstraint>`);
  lines.push(`    <referenceTo>${spec.referenceTo}</referenceTo>`);
  lines.push(`    <relationshipLabel>${escapeXml(spec.relationshipLabel)}</relationshipLabel>`);
  lines.push(`    <relationshipName>${spec.relationshipName}</relationshipName>`);

  if (spec.required !== undefined) {
    lines.push(`    <required>${spec.required ? 'true' : 'false'}</required>`);
  }

  lines.push(`    <type>Lookup</type>`);

  return lines;
}

function buildMasterDetailFieldXml(spec: MasterDetailFieldSpec): string[] {
  const lines: string[] = [];

  lines.push(`    <referenceTo>${spec.referenceTo}</referenceTo>`);
  lines.push(`    <relationshipLabel>${escapeXml(spec.relationshipLabel)}</relationshipLabel>`);
  lines.push(`    <relationshipName>${spec.relationshipName}</relationshipName>`);
  lines.push(`    <relationshipOrder>${spec.relationshipOrder}</relationshipOrder>`);

  if (spec.reparentableMasterDetail !== undefined) {
    lines.push(`    <reparentableMasterDetail>${spec.reparentableMasterDetail ? 'true' : 'false'}</reparentableMasterDetail>`);
  }

  lines.push(`    <type>MasterDetail</type>`);

  if (spec.writeRequiresMasterRead !== undefined) {
    lines.push(`    <writeRequiresMasterRead>${spec.writeRequiresMasterRead ? 'true' : 'false'}</writeRequiresMasterRead>`);
  }

  return lines;
}

function buildPicklistFieldXml(spec: PicklistFieldSpec): string[] {
  const lines: string[] = [];

  if (spec.required !== undefined) {
    lines.push(`    <required>${spec.required ? 'true' : 'false'}</required>`);
  }

  lines.push(`    <type>Picklist</type>`);
  lines.push(...buildValueSetXml(spec.valueSet));

  return lines;
}

function buildMultiselectPicklistFieldXml(spec: MultiselectPicklistFieldSpec): string[] {
  const lines: string[] = [];

  if (spec.required !== undefined) {
    lines.push(`    <required>${spec.required ? 'true' : 'false'}</required>`);
  }

  lines.push(`    <type>MultiselectPicklist</type>`);
  lines.push(...buildValueSetXml(spec.valueSet));
  lines.push(`    <visibleLines>${spec.visibleLines}</visibleLines>`);

  return lines;
}

function buildFormulaFieldXml(spec: FormulaFieldSpec): string[] {
  const lines: string[] = [];

  lines.push(`    <formula>${escapeXml(spec.formula)}</formula>`);

  if (spec.formulaTreatBlanksAs !== undefined) {
    lines.push(`    <formulaTreatBlanksAs>${spec.formulaTreatBlanksAs}</formulaTreatBlanksAs>`);
  }

  // Numeric return types require precision and scale
  if (['Number', 'Currency', 'Percent'].includes(spec.returnType)) {
    if (spec.precision !== undefined) {
      lines.push(`    <precision>${spec.precision}</precision>`);
    }
    if (spec.scale !== undefined) {
      lines.push(`    <scale>${spec.scale}</scale>`);
    }
  }

  if (spec.required !== undefined) {
    lines.push(`    <required>${spec.required ? 'true' : 'false'}</required>`);
  }

  lines.push(`    <type>${spec.returnType}</type>`);

  return lines;
}

function buildRollupSummaryFieldXml(spec: RollupSummaryFieldSpec): string[] {
  const lines: string[] = [];

  lines.push(`    <summaryForeignKey>${spec.summaryForeignKey}</summaryForeignKey>`);
  lines.push(`    <summaryOperation>${spec.summaryOperation}</summaryOperation>`);

  // summarizedField is required for SUM, MIN, MAX operations
  if (spec.summaryOperation !== 'COUNT' && spec.summarizedField) {
    lines.push(`    <summarizedField>${spec.summarizedField}</summarizedField>`);
  }

  lines.push(`    <type>Summary</type>`);

  return lines;
}

function buildValueSetXml(valueSet: { restricted?: boolean; sorted?: boolean; values: { fullName: string; label: string; default?: boolean }[] }): string[] {
  const lines: string[] = [];

  lines.push(`    <valueSet>`);

  if (valueSet.restricted !== undefined) {
    lines.push(`        <restricted>${valueSet.restricted ? 'true' : 'false'}</restricted>`);
  }

  lines.push(`        <valueSetDefinition>`);

  if (valueSet.sorted !== undefined) {
    lines.push(`            <sorted>${valueSet.sorted ? 'true' : 'false'}</sorted>`);
  }

  for (const value of valueSet.values) {
    lines.push(`            <value>`);
    lines.push(`                <fullName>${escapeXml(value.fullName)}</fullName>`);
    lines.push(`                <default>${value.default ? 'true' : 'false'}</default>`);
    lines.push(`                <label>${escapeXml(value.label)}</label>`);
    lines.push(`            </value>`);
  }

  lines.push(`        </valueSetDefinition>`);
  lines.push(`    </valueSet>`);

  return lines;
}

function escapeXml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}
