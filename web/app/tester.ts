

import { generateText, stepCountIs } from 'ai';
import { MockLanguageModelV3 } from 'ai/test';
import { createSfdxJobTools } from '@/lib/sfdx/job-tools';
import { createJobStatusTools } from '@/lib/tools/jobs';

import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://rpcoxcpgcqtkwthphtau.supabase.co"
const supabaseServiceKey = "sb_secret_SqR0npQzIqqqnSdBf2Z-pQ_kR5bzoY0"

console.log(supabaseUrl, supabaseServiceKey);

export const supabase = createClient(supabaseUrl, supabaseServiceKey);

const PROJECT_ID = '2a30440f-677a-48d6-906a-b4df6c5e4e43';

async function cleanupTestJobs() {
  console.log("🧹 Cleaning up test jobs...");
  const { data } = await supabase
    .from('jobs')
    .delete()
    .eq('project_id', PROJECT_ID)
    .select();
  console.log(`  Deleted ${data?.length ?? 0} test job(s)`);
}

async function test1_createObjectJob() {
  console.log('\n📦 TEST 1: Create a "create_object" job via tool');

  const tools = createSfdxJobTools(PROJECT_ID);

  // Call the tool directly
  const result = await (tools.createObject as any).execute({
    fullName: 'TestObject__c',
    label: 'Test Object',
    pluralLabel: 'Test Objects',
    sharingModel: 'ReadWrite',
    visibility: 'Public',
    nameField: { label: 'Test Name', type: 'Text' },
  });

  console.log('  Result:', JSON.stringify(result, null, 2));

  // Verify the job was inserted
  const { data, error } = await supabase
    .from('jobs')
    .select('*')
    .eq('project_id', PROJECT_ID)
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  if (error) throw error;

  console.log('  ✅ Job inserted into DB:', {
    id: data.id,
    type: data.type,
    status: data.status,
    payload_type: typeof data.payload,
  });

  return data.id;
}

async function test2_checkJobStatus() {
  console.log('\n📋 TEST 2: Check job status via checkJobStatus tool');

  const tools = createJobStatusTools(PROJECT_ID);

  const result = await (tools.checkJobStatus as any).execute({});

  console.log('  Result:', JSON.stringify(result, null, 2));

  if (!result.success) {
    throw new Error('checkJobStatus failed: ' + result.error);
  }

  if (!result.jobs || result.jobs.length === 0) {
    throw new Error('Expected at least 1 job in result');
  }

  console.log('  ✅ checkJobStatus returned', result.jobs.length, 'job(s)');
}

async function test3_jobHasValidStructure() {
  console.log('\n🔍 TEST 3: Verify job structure in DB');

  const { data, error } = await supabase
    .from('jobs')
    .select('*')
    .eq('project_id', PROJECT_ID)
    .eq('type', 'create_object')
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  if (error) throw error;

  if (data.status !== 'pending') {
    throw new Error(`Expected status "pending" but got "${data.status}"`);
  }

  if (data.payload?.fullName !== 'TestObject__c') {
    throw new Error('Payload missing expected fullName');
  }

  console.log('  ✅ Job structure is valid');
}

async function main() {
  try {
    await cleanupTestJobs();

    const jobId = await test1_createObjectJob();
    await test2_checkJobStatus();
    await test3_jobHasValidStructure();

    console.log('\n✅ All tests passed!');
    console.log('   Job ID:', jobId);
    console.log('   You can verify the pending job in Supabase or wait for the SFDX worker to pick it up.');
  } catch (err) {
    console.error('\n❌ Test failed:', err);
    process.exit(1);
  }
}

main();
