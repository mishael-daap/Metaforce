import { CustomObjectSpec } from '../../types/CustomObjectSpec.js';

const XML_NAMESPACE = 'http://soap.sforce.com/2006/04/metadata';

export function buildCustomObjectXml(spec: CustomObjectSpec): string {
  const lines: string[] = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    `<CustomObject xmlns="${XML_NAMESPACE}">`
  ];

  // nameField (required, must come before pluralLabel per SF order)
  lines.push('    <nameField>');
  lines.push(`        <label>${escapeXml(spec.nameField.label)}</label>`);
  if (spec.nameField.trackHistory !== undefined) {
    lines.push(`        <trackHistory>${spec.nameField.trackHistory ? 'true' : 'false'}</trackHistory>`);
  }
  lines.push(`        <type>${spec.nameField.type}</type>`);
  if (spec.nameField.type === 'AutoNumber') {
    if (spec.nameField.displayFormat) {
      lines.push(`        <displayFormat>${escapeXml(spec.nameField.displayFormat)}</displayFormat>`);
    }
    if (spec.nameField.scale !== undefined) {
      lines.push(`        <scale>${spec.nameField.scale}</scale>`);
    }
  }
  lines.push('    </nameField>');

  // Optional string fields
  if (spec.description) {
    lines.push(`    <description>${escapeXml(spec.description)}</description>`);
  }

  // Boolean fields (only if explicitly set)
  if (spec.allowInChatterGroups !== undefined) {
    lines.push(`    <allowInChatterGroups>${spec.allowInChatterGroups ? 'true' : 'false'}</allowInChatterGroups>`);
  }
  if (spec.enableActivities !== undefined) {
    lines.push(`    <enableActivities>${spec.enableActivities ? 'true' : 'false'}</enableActivities>`);
  }
  if (spec.enableBulkApi !== undefined) {
    lines.push(`    <enableBulkApi>${spec.enableBulkApi ? 'true' : 'false'}</enableBulkApi>`);
  }
  if (spec.enableFeeds !== undefined) {
    lines.push(`    <enableFeeds>${spec.enableFeeds ? 'true' : 'false'}</enableFeeds>`);
  }
  if (spec.enableHistory !== undefined) {
    lines.push(`    <enableHistory>${spec.enableHistory ? 'true' : 'false'}</enableHistory>`);
  }
  if (spec.enableReports !== undefined) {
    lines.push(`    <enableReports>${spec.enableReports ? 'true' : 'false'}</enableReports>`);
  }
  if (spec.enableSearch !== undefined) {
    lines.push(`    <enableSearch>${spec.enableSearch ? 'true' : 'false'}</enableSearch>`);
  }
  if (spec.enableSharing !== undefined) {
    lines.push(`    <enableSharing>${spec.enableSharing ? 'true' : 'false'}</enableSharing>`);
  }
  if (spec.enableStreamingApi !== undefined) {
    lines.push(`    <enableStreamingApi>${spec.enableStreamingApi ? 'true' : 'false'}</enableStreamingApi>`);
  }

  // externalSharingModel (only if sharingModel is not ControlledByParent)
  if (spec.externalSharingModel) {
    lines.push(`    <externalSharingModel>${escapeXml(spec.externalSharingModel)}</externalSharingModel>`);
  }

  // Required fields
  lines.push(`    <deploymentStatus>${spec.deploymentStatus}</deploymentStatus>`);
  lines.push(`    <label>${escapeXml(spec.label)}</label>`);
  lines.push(`    <pluralLabel>${escapeXml(spec.pluralLabel)}</pluralLabel>`);

  if (spec.compactLayoutAssignment) {
    lines.push(`    <compactLayoutAssignment>${escapeXml(spec.compactLayoutAssignment)}</compactLayoutAssignment>`);
  }

  lines.push(`    <sharingModel>${spec.sharingModel}</sharingModel>`);
  lines.push(`    <visibility>${spec.visibility}</visibility>`);

  lines.push('</CustomObject>');

  return lines.join('\n');
}

function escapeXml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}