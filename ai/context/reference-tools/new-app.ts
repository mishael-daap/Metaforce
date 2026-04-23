import { authenticateOrg } from './generators/authenticateOrg.js';
import { deployMetadata } from './generators/deployMetadata.js';
import { createProject } from './generators/createProject.js';
import { createCustomObject } from './generators/createCustomObject.js';
import { createCustomField } from './generators/createCustomField.js';
import { ProjectSpec } from './types/ProjectSpec.js';
import { CustomObjectSpec } from './types/CustomObjectSpec.js';
import { TextFieldSpec } from './types/CustomFieldSpec.js';

const ACCESS_TOKEN = '';
const INSTANCE_URL = 'https://orgfarm-cf567c8e83-dev-ed.develop.my.salesforce.com';
const PROJECT_ID = 'test-deploy-demo';
const OBJECT_NAME = 'Deploy_Test__c';

async function runDemo() {
  console.log('=== deployMetadata Function Demo ===\n');

  // Step 1: Authenticate
  console.log('Step 1: Authenticating to Salesforce org...');
  const authResult = await authenticateOrg({
    accessToken: ACCESS_TOKEN,
    instanceUrl: INSTANCE_URL,
    alias: 'DemoOrg'
  });

  if (!authResult.success) {
    console.log(`✗ Authentication failed: ${authResult.error}`);
    return;
  }
  console.log(`✓ Authenticated as alias: ${authResult.alias}\n`);

  // Step 2: Create Project
  console.log('Step 2: Creating test project...');
  const projectSpec: ProjectSpec = {
    projectId: PROJECT_ID,
    name: 'Deploy Demo Project',
    apiVersion: '66.0'
  };

  const projectResult = await createProject(projectSpec);
  if (!projectResult.success) {
    console.log(`✗ Failed to create project: ${projectResult.error}`);
    return;
  }
  console.log(`✓ Project created: ${projectResult.projectPath}\n`);

  // Step 3: Create Object
  console.log('Step 3: Creating test object...');
  const objectSpec: CustomObjectSpec = {
    fullName: OBJECT_NAME,
    label: 'Deploy Test',
    pluralLabel: 'Deploy Tests',
    deploymentStatus: 'InDevelopment',
    sharingModel: 'ReadWrite',
    visibility: 'Public',
    nameField: {
      label: 'Deploy Test Name',
      type: 'Text'
    }
  };

  const objectResult = await createCustomObject(PROJECT_ID, objectSpec);
  if (!objectResult.success) {
    console.log(`✗ Failed to create object: ${objectResult.error}`);
    return;
  }
  console.log(`✓ Object created: ${objectResult.outputPath}\n`);

  // Step 4: Create Field
  console.log('Step 4: Creating test field...');
  const fieldSpec: TextFieldSpec = {
    fullName: 'Description__c',
    label: 'Description',
    type: 'Text',
    length: 255
  };

  const fieldResult = await createCustomField(PROJECT_ID, OBJECT_NAME, fieldSpec);
  if (!fieldResult.success) {
    console.log(`✗ Failed to create field: ${fieldResult.error}`);
    return;
  }
  console.log(`✓ Field created: ${fieldResult.outputPath}\n`);

  // Step 5: Dry-run Deploy
  console.log('Step 5: Running dry-run deployment validation...');
  const dryRunResult = await deployMetadata({
    projectId: PROJECT_ID,
    targetOrg: authResult.alias!,
    dryRun: true
  });

  if (dryRunResult.success) {
    console.log(`✓ Dry-run validation passed`);
    console.log(`  Deployment ID: ${dryRunResult.deploymentId}`);
    console.log(`  Component Successes: ${dryRunResult.componentSuccesses}`);
    console.log(`  Component Failures: ${dryRunResult.componentFailures}`);
  } else {
    console.log(`✗ Dry-run validation failed: ${dryRunResult.error}`);
    console.log(`  Component Successes: ${dryRunResult.componentSuccesses}`);
    console.log(`  Component Failures: ${dryRunResult.componentFailures}`);
    return;
  }

  // Step 6: Actual Deploy
  console.log('\nStep 6: Running actual deployment...');
  const deployResult = await deployMetadata({
    projectId: PROJECT_ID,
    targetOrg: authResult.alias!,
    dryRun: false
  });

  if (deployResult.success) {
    console.log(`✓ Deployment successful!`);
    console.log(`  Deployment ID: ${deployResult.deploymentId}`);
    console.log(`  Component Successes: ${deployResult.componentSuccesses}`);
    console.log(`  Component Failures: ${deployResult.componentFailures}`);
  } else {
    console.log(`✗ Deployment failed: ${deployResult.error}`);
    console.log(`  Component Successes: ${deployResult.componentSuccesses}`);
    console.log(`  Component Failures: ${deployResult.componentFailures}`);
  }

  console.log('\n=== Demo Complete ===');
}

runDemo().catch(console.error);
