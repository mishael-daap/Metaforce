import * as fs from 'fs';
import * as path from 'path';
import { buildCustomFieldXml } from '../xml/builders/customFieldBuilder.js';
export async function createCustomField(projectId, objectName, spec) {
    try {
        // Validate inputs
        const validationResult = validateInputs(projectId, objectName, spec);
        if (!validationResult.valid) {
            return {
                success: false,
                error: validationResult.error
            };
        }
        // Build output path: [projectId]/force-app/objects/<ObjectName>/fields/
        const outputDir = path.join(process.cwd(), projectId, 'force-app', 'objects', objectName, 'fields');
        // Create directory if it doesn't exist
        if (!fs.existsSync(outputDir)) {
            fs.mkdirSync(outputDir, { recursive: true });
        }
        // Build XML content
        const xmlContent = buildCustomFieldXml(spec);
        // Write XML file: <FieldName>.field-meta.xml
        const xmlFileName = `${spec.fullName}.field-meta.xml`;
        const xmlFilePath = path.join(outputDir, xmlFileName);
        fs.writeFileSync(xmlFilePath, xmlContent, 'utf-8');
        return {
            success: true,
            outputPath: xmlFilePath
        };
    }
    catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
        return {
            success: false,
            error: errorMessage
        };
    }
}
function validateInputs(projectId, objectName, spec) {
    // Check required fields
    if (!projectId) {
        return { valid: false, error: 'projectId is required' };
    }
    if (!objectName) {
        return { valid: false, error: 'objectName is required' };
    }
    if (!spec.fullName) {
        return { valid: false, error: 'fullName is required' };
    }
    if (!spec.label) {
        return { valid: false, error: 'label is required' };
    }
    if (!spec.type) {
        return { valid: false, error: 'type is required' };
    }
    // Validate fullName ends with __c
    if (!spec.fullName.endsWith('__c')) {
        return { valid: false, error: 'fullName must end with __c' };
    }
    // Validate objectName ends with __c
    if (!objectName.endsWith('__c')) {
        return { valid: false, error: 'objectName must end with __c' };
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
            // Validate summaryOperation is a valid value
            const validOperations = ['COUNT', 'SUM', 'MIN', 'MAX'];
            if (!validOperations.includes(spec.summaryOperation)) {
                return { valid: false, error: `summaryOperation must be one of: ${validOperations.join(', ')}` };
            }
            break;
    }
    // Validate type is one of the supported types
    const validTypes = ['Text', 'TextArea', 'LongTextArea', 'Html', 'EncryptedText', 'Number', 'Currency', 'Percent', 'Location', 'Checkbox', 'Date', 'DateTime', 'Time', 'Email', 'Phone', 'Url', 'AutoNumber', 'Lookup', 'MasterDetail', 'Picklist', 'MultiselectPicklist', 'Formula', 'Summary'];
    if (!validTypes.includes(spec.type)) {
        return { valid: false, error: `type must be one of: ${validTypes.join(', ')}` };
    }
    return { valid: true };
}
//# sourceMappingURL=createCustomField.js.map