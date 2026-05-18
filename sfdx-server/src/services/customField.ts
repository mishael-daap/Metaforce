import * as fs from 'fs';
import * as path from 'path';
import type { CustomFieldSpec } from '../types/CustomFieldSpec.js';
import { buildCustomFieldXml } from '../xml/builders/customFieldBuilder.js';

export interface CustomFieldResult {
  success: boolean;
  outputPath?: string;
  xml?: string;
  error?: string;
}

export async function createCustomField(
  projectId: string,
  objectName: string,
  spec: CustomFieldSpec
): Promise<CustomFieldResult> {
  try {
    const validationResult = validateInputs(projectId, objectName, spec);
    if (!validationResult.valid) {
      return {
        success: false,
        error: validationResult.error
      };
    }

    const projectPath = path.join(process.cwd(), 'projects', projectId);

    if (!fs.existsSync(projectPath)) {
      return {
        success: false,
        error: `Project '${projectId}' does not exist. Project must be initialized before creating metadata.`
      };
    }

    const outputDir = path.join(projectPath, 'force-app', 'objects', objectName, 'fields');

    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    const xmlContent = buildCustomFieldXml(spec);
    const xmlFileName = `${spec.fullName}.field-meta.xml`;
    const xmlFilePath = path.join(outputDir, xmlFileName);
    fs.writeFileSync(xmlFilePath, xmlContent, 'utf-8');

    return {
      success: true,
      outputPath: xmlFilePath,
      xml: xmlContent
    };
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
    return {
      success: false,
      error: errorMessage
    };
  }
}

interface ValidationResult {
  valid: boolean;
  error?: string;
}

function validateInputs(
  projectId: string,
  objectName: string,
  spec: CustomFieldSpec
): ValidationResult {
  if (!projectId) {
    return { valid: false, error: 'projectId is required' };
  }

  if (!objectName) {
    return { valid: false, error: 'objectName is required' };
  }

  if (!objectName.endsWith('__c')) {
    return { valid: false, error: 'objectName must end with __c' };
  }

  if (!spec.fullName) {
    return { valid: false, error: 'field fullName is required' };
  }

  if (!spec.fullName.endsWith('__c')) {
    return { valid: false, error: 'field fullName must end with __c' };
  }

  if (!spec.label) {
    return { valid: false, error: 'label is required' };
  }

  if (!spec.type) {
    return { valid: false, error: 'type is required' };
  }

  // Type-specific validation
  switch (spec.type) {
    case 'LongTextArea':
    case 'Html':
      if (spec.visibleLines === undefined) {
        return { valid: false, error: `visibleLines is required for ${spec.type} fields` };
      }
      break;
    case 'EncryptedText':
      if (spec.length === undefined) {
        return { valid: false, error: 'length is required for EncryptedText fields' };
      }
      if (!spec.maskChar) {
        return { valid: false, error: 'maskChar is required for EncryptedText fields' };
      }
      if (!spec.maskType) {
        return { valid: false, error: 'maskType is required for EncryptedText fields' };
      }
      break;
    case 'Number':
    case 'Currency':
    case 'Percent':
      if (spec.precision === undefined) {
        return { valid: false, error: `precision is required for ${spec.type} fields` };
      }
      if (spec.scale === undefined) {
        return { valid: false, error: `scale is required for ${spec.type} fields` };
      }
      break;
    case 'AutoNumber':
      if (!spec.displayFormat) {
        return { valid: false, error: 'displayFormat is required for AutoNumber fields' };
      }
      break;
    case 'Lookup':
      if (!spec.referenceTo) {
        return { valid: false, error: 'referenceTo is required for Lookup fields' };
      }
      if (!spec.relationshipName) {
        return { valid: false, error: 'relationshipName is required for Lookup fields' };
      }
      if (!spec.relationshipLabel) {
        return { valid: false, error: 'relationshipLabel is required for Lookup fields' };
      }
      break;
    case 'MasterDetail':
      if (!spec.referenceTo) {
        return { valid: false, error: 'referenceTo is required for MasterDetail fields' };
      }
      if (!spec.relationshipName) {
        return { valid: false, error: 'relationshipName is required for MasterDetail fields' };
      }
      if (!spec.relationshipLabel) {
        return { valid: false, error: 'relationshipLabel is required for MasterDetail fields' };
      }
      if (spec.relationshipOrder === undefined) {
        return { valid: false, error: 'relationshipOrder is required for MasterDetail fields' };
      }
      break;
    case 'Formula':
      if (!spec.formula) {
        return { valid: false, error: 'formula is required for Formula fields' };
      }
      break;
    case 'Summary':
      if (!spec.summaryForeignKey) {
        return { valid: false, error: 'summaryForeignKey is required for Summary fields' };
      }
      if (!spec.summaryOperation) {
        return { valid: false, error: 'summaryOperation is required for Summary fields' };
      }
      if (spec.summaryOperation !== 'COUNT' && !spec.summarizedField) {
        return { valid: false, error: 'summarizedField is required for Summary fields with operation ' + spec.summaryOperation };
      }
      break;
  }

  return { valid: true };
}
