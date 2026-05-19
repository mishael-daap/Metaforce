const BASE_URL = 'http://localhost:8000';
const API_KEY = 'password';
const PROJECT_ID = 'tester-project-01';
const ACCESS_TOKEN = '00DgK00000FEwjR!AQEAQNE4m1q4lnm_UEG0T7Fl65ROWfFX4yHB4tGs09qsX8aS15Xj5obSFU3FoMAFPMTMrZNoisXk_CnUlKoHDvUVnPgKxw42';
const ORG_URL = 'https://orgfarm-cf567c8e83-dev-ed.develop.my.salesforce.com';

const headers: Record<string, string> = {
  'Content-Type': 'application/json',
  'x-api-key': API_KEY,
  'x-project-id': PROJECT_ID,
  'x-access-token': ACCESS_TOKEN,
  'x-org-url': ORG_URL,
};

interface TestResult {
  name: string;
  method: string;
  path: string;
  status: number;
  success: boolean;
  durationMs: number;
  error?: string;
}

const results: TestResult[] = [];

async function request(name: string, method: string, path: string, body?: any): Promise<any> {
  const url = `${BASE_URL}${path}`;
  const start = Date.now();

  try {
    const res = await fetch(url, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });

    const durationMs = Date.now() - start;
    const data: any = await res.json();
    const success = data.success === true || data.status === true;
    const error = data.error || undefined;

    results.push({ name, method, path, status: res.status, success, durationMs, error });

    console.log(`\n${'='.repeat(60)}`);
    console.log(`${method} ${path} — ${name}`);
    console.log(`Status: ${res.status} | Duration: ${durationMs}ms | Success: ${success}`);
    if (error) console.log(`Error: ${error}`);
    const preview = JSON.stringify(data, null, 2);
    console.log(`Response: ${preview.length > 600 ? preview.slice(0, 600) + '...' : preview}`);

    return data;
  } catch (err: any) {
    const durationMs = Date.now() - start;
    results.push({ name, method, path, status: 0, success: false, durationMs, error: err.message });

    console.log(`\n${'='.repeat(60)}`);
    console.log(`${method} ${path} — ${name}`);
    console.log(`FAILED | Duration: ${durationMs}ms`);
    console.log(`Error: ${err.message}`);

    return null;
  }
}

async function run() {
  console.log('\n' + '#'.repeat(60));
  console.log('  SFDX Server Route Tester');
  console.log(`  Base URL: ${BASE_URL}`);
  console.log(`  Project:  ${PROJECT_ID}`);
  console.log('#'.repeat(60));

  // 1. Health check
  await request('Health Check', 'GET', '/health');

  // 2. Create first custom object
  await request('Create Object: TesterObj__c', 'POST', '/metadata/objects', {
    fullName: 'TesterObj__c',
    label: 'Tester Object',
    pluralLabel: 'Tester Objects',
    description: 'Created by route tester',
    deploymentStatus: 'Deployed',
    sharingModel: 'ReadWrite',
    visibility: 'Public',
    nameField: { label: 'Tester Obj Name', type: 'Text' },
  });

  // 3. Create second custom object
  await request('Create Object: SecondObj__c', 'POST', '/metadata/objects', {
    fullName: 'SecondObj__c',
    label: 'Second Object',
    pluralLabel: 'Second Objects',
    deploymentStatus: 'Deployed',
    sharingModel: 'ReadWrite',
    visibility: 'Public',
    nameField: { label: 'Second Obj Name', type: 'AutoNumber', displayFormat: 'SEC-{00000}' },
  });

  // 4. List all objects
  await request('List All Objects', 'GET', '/metadata/objects');

  // 5. Get specific object
  await request('Get Object: TesterObj__c', 'GET', '/metadata/objects/TesterObj__c');

  // 6. Create a Text field
  await request('Create Field: Description__c on TesterObj__c', 'POST', '/metadata/fields', {
    objectName: 'TesterObj__c',
    field: {
      fullName: 'Description__c',
      label: 'Description',
      type: 'Text',
      length: 255,
      required: false,
    },
  });

  // 7. Create a Number field
  await request('Create Field: Score__c on TesterObj__c', 'POST', '/metadata/fields', {
    objectName: 'TesterObj__c',
    field: {
      fullName: 'Score__c',
      label: 'Score',
      type: 'Number',
      precision: 18,
      scale: 2,
      required: false,
    },
  });

  // 8. Create a Checkbox field on SecondObj__c
  await request('Create Field: Active__c on SecondObj__c', 'POST', '/metadata/fields', {
    objectName: 'SecondObj__c',
    field: {
      fullName: 'Active__c',
      label: 'Active',
      type: 'Checkbox',
      defaultValue: false,
    },
  });

  // 9. Get object with its fields
  await request('Get Object with Fields: TesterObj__c', 'GET', '/metadata/objects/TesterObj__c');

  // 10. Update the object (change description + enable reports)
  await request('Update Object: TesterObj__c', 'PUT', '/metadata/objects/TesterObj__c', {
    fullName: 'TesterObj__c',
    label: 'Tester Object',
    pluralLabel: 'Tester Objects',
    description: 'Updated by route tester',
    deploymentStatus: 'Deployed',
    sharingModel: 'ReadWrite',
    visibility: 'Public',
    enableReports: true,
    nameField: { label: 'Tester Obj Name', type: 'Text' },
  });

  // 11. Update a field (change label + length)
  await request('Update Field: Description__c on TesterObj__c', 'PUT', '/metadata/fields/TesterObj__c/Description__c', {
    field: {
      fullName: 'Description__c',
      label: 'Detailed Description',
      type: 'Text',
      length: 500,
      required: false,
    },
  });

  // 12. List all objects after updates
  await request('List All Objects (after updates)', 'GET', '/metadata/objects');

  // 13. Delete a field from TesterObj__c
  await request('Delete Field: Score__c from TesterObj__c', 'DELETE', '/metadata/fields/TesterObj__c/Score__c');

  // 14. Delete a field from SecondObj__c
  await request('Delete Field: Active__c from SecondObj__c', 'DELETE', '/metadata/fields/SecondObj__c/Active__c');

  // 15. Delete TesterObj__c
  await request('Delete Object: TesterObj__c', 'DELETE', '/metadata/objects/TesterObj__c');

  // 16. Delete SecondObj__c
  await request('Delete Object: SecondObj__c', 'DELETE', '/metadata/objects/SecondObj__c');

  // 17. List all objects (should be empty)
  await request('List All Objects (should be empty)', 'GET', '/metadata/objects');

  // ---- Summary ----
  console.log('\n\n' + '#'.repeat(60));
  console.log('  SUMMARY');
  console.log('#'.repeat(60));
  console.log('');

  const colW = [4, 44, 8, 6, 10, 46];
  const header = ['#', 'Name', 'Method', 'Status', 'Time(ms)', 'Path'].map((h, i) => h.padEnd(colW[i])).join(' ');
  console.log(header);
  console.log('-'.repeat(header.length));

  for (let i = 0; i < results.length; i++) {
    const r = results[i];
    const row = [
      String(i + 1).padEnd(colW[0]),
      r.name.padEnd(colW[1]).slice(0, colW[1]),
      r.method.padEnd(colW[2]),
      String(r.status).padEnd(colW[3]),
      String(r.durationMs).padEnd(colW[4]),
      r.path.padEnd(colW[5]).slice(0, colW[5]),
    ].join(' ');
    const mark = r.success ? 'OK' : 'FAIL';
    console.log(`${row}  ${mark}`);
  }

  console.log('');
  const passed = results.filter(r => r.success).length;
  const failed = results.filter(r => !r.success).length;
  const totalMs = results.reduce((sum, r) => sum + r.durationMs, 0);
  console.log(`Total: ${results.length} | Passed: ${passed} | Failed: ${failed} | Time: ${totalMs}ms`);
  console.log('');
}

run();
