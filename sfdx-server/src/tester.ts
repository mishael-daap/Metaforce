import * as https from "https";
import * as http from "http";

// ─── CONFIG ────────────────────────────────────────────────────────────────────
const CONFIG = {
  baseUrl: "http://localhost:8000",
  apiKey: process.env.SFDX_API_KEY ?? "password",
  projectId: process.env.SFDX_PROJECT_ID ?? "my-project-01",
  accessToken: process.env.SFDX_ACCESS_TOKEN ?? "YOUR_ACCESS_TOKEN",
  orgUrl: process.env.SFDX_ORG_URL ?? "https://myorg.salesforce.com",
};

// Test objects/fields to create
const TEST_OBJECTS = [
  {
    fullName: "TestVehicle__c",
    label: "Test Vehicle",
    pluralLabel: "Test Vehicles",
    description: "Auto-generated test object: Vehicle",
    deploymentStatus: "Deployed" as const,
    sharingModel: "ReadWrite" as const,
    visibility: "Public" as const,
    nameField: { label: "Vehicle Name", type: "Text" },
    enableActivities: true,
    enableReports: true,
    enableSearch: true,
  },
  {
    fullName: "TestInventory__c",
    label: "Test Inventory",
    pluralLabel: "Test Inventories",
    description: "Auto-generated test object: Inventory",
    deploymentStatus: "Deployed" as const,
    sharingModel: "Private" as const,
    visibility: "Public" as const,
    nameField: { label: "Inventory Name", type: "Text" },
    enableBulkApi: true,
    enableReports: true,
  },
];

const TEST_FIELDS: Record<string, object[]> = {
  TestVehicle__c: [
    {
      fullName: "Mileage__c",
      label: "Mileage",
      type: "Number",
      precision: 10,
      scale: 2,
      required: false,
      description: "Vehicle mileage in km",
    },
    {
      fullName: "Color__c",
      label: "Color",
      type: "Text",
      length: 100,
      required: false,
    },
    {
      fullName: "IsAvailable__c",
      label: "Is Available",
      type: "Checkbox",
      defaultValue: true,
    },
  ],
  TestInventory__c: [
    {
      fullName: "StockCount__c",
      label: "Stock Count",
      type: "Number",
      precision: 8,
      scale: 0,
      required: true,
    },
    {
      fullName: "Notes__c",
      label: "Notes",
      type: "LongTextArea",
      length: 32768,
      visibleLines: 5,
    },
  ],
};

// ─── TYPES ─────────────────────────────────────────────────────────────────────
interface TestResult {
  step: number;
  name: string;
  method: string;
  url: string;
  status: "PASS" | "FAIL" | "SKIP";
  httpStatus: number | null;
  responseTimeMs: number;
  error?: string;
  note?: string;
}

// ─── HTTP HELPER ───────────────────────────────────────────────────────────────
function request<T>(
  method: string,
  path: string,
  body?: object,
  authenticated = true
): Promise<{ data: T; httpStatus: number; responseTimeMs: number }> {
  return new Promise((resolve, reject) => {
    const url = new URL(CONFIG.baseUrl + path);
    const isHttps = url.protocol === "https:";
    const bodyStr = body ? JSON.stringify(body) : undefined;

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };
    if (authenticated) {
      headers["x-api-key"] = CONFIG.apiKey;
      headers["x-project-id"] = CONFIG.projectId;
      headers["x-access-token"] = CONFIG.accessToken;
      headers["x-org-url"] = CONFIG.orgUrl;
    }
    if (bodyStr) {
      headers["Content-Length"] = Buffer.byteLength(bodyStr).toString();
    }

    const options = {
      hostname: url.hostname,
      port: url.port || (isHttps ? 443 : 80),
      path: url.pathname + url.search,
      method,
      headers,
    };

    const start = Date.now();
    const lib = isHttps ? https : http;

    const req = lib.request(options, (res) => {
      let raw = "";
      res.on("data", (chunk) => (raw += chunk));
      res.on("end", () => {
        const responseTimeMs = Date.now() - start;
        try {
          resolve({ data: JSON.parse(raw) as T, httpStatus: res.statusCode ?? 0, responseTimeMs });
        } catch {
          resolve({ data: raw as unknown as T, httpStatus: res.statusCode ?? 0, responseTimeMs });
        }
      });
    });

    req.on("error", (err) => reject(err));
    if (bodyStr) req.write(bodyStr);
    req.end();
  });
}

// ─── RUNNER ────────────────────────────────────────────────────────────────────
const results: TestResult[] = [];
let stepCounter = 0;

async function run(
  name: string,
  method: string,
  path: string,
  opts: { body?: object; authenticated?: boolean; expectStatus?: number; note?: string } = {}
): Promise<{ data: unknown; passed: boolean }> {
  const { body, authenticated = true, expectStatus = 200, note } = opts;
  const step = ++stepCounter;
  const url = CONFIG.baseUrl + path;

  process.stdout.write(`  [${String(step).padStart(2, "0")}] ${method.padEnd(6)} ${path} ... `);

  try {
    const { data, httpStatus, responseTimeMs } = await request<unknown>(method, path, body, authenticated);
    const passed = httpStatus === expectStatus;
    const status = passed ? "PASS" : "FAIL";
    const anyData = data as Record<string, unknown>;
    const apiOk = anyData?.status === true || anyData?.success === true;
    const finalStatus: "PASS" | "FAIL" = passed && apiOk ? "PASS" : "FAIL";
    const error = !passed
      ? `Expected HTTP ${expectStatus}, got ${httpStatus}`
      : !apiOk
      ? `API returned status=false: ${anyData?.error ?? "unknown"}`
      : undefined;

    results.push({ step, name, method, url, status: finalStatus, httpStatus, responseTimeMs, error, note });

    const tag = finalStatus === "PASS" ? "✓ PASS" : "✗ FAIL";
    console.log(`${tag}  (${responseTimeMs}ms)`);
    if (error) console.log(`         ↳ ${error}`);

    return { data, passed: finalStatus === "PASS" };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    results.push({ step, name, method, url, status: "FAIL", httpStatus: null, responseTimeMs: 0, error: msg, note });
    console.log(`✗ FAIL  (connection error)`);
    console.log(`         ↳ ${msg}`);
    return { data: null, passed: false };
  }
}

// ─── REPORT ────────────────────────────────────────────────────────────────────
function printReport(totalMs: number) {
  const passes = results.filter((r) => r.status === "PASS").length;
  const fails = results.filter((r) => r.status === "FAIL").length;
  const avgTime = results.length
    ? Math.round(results.reduce((s, r) => s + r.responseTimeMs, 0) / results.length)
    : 0;
  const slowest = results.slice().sort((a, b) => b.responseTimeMs - a.responseTimeMs)[0];
  const fastest = results.slice().sort((a, b) => a.responseTimeMs - b.responseTimeMs)[0];

  console.log("\n" + "═".repeat(72));
  console.log("  SFDX API TEST REPORT");
  console.log("═".repeat(72));
  console.log(`  Ran at      : ${new Date().toISOString()}`);
  console.log(`  Total time  : ${(totalMs / 1000).toFixed(2)}s`);
  console.log(`  Requests    : ${results.length}  |  ✓ ${passes} passed  |  ✗ ${fails} failed`);
  console.log(`  Avg latency : ${avgTime}ms  |  Fastest: ${fastest?.responseTimeMs}ms  |  Slowest: ${slowest?.responseTimeMs}ms`);
  console.log("─".repeat(72));

  console.log("\n  FULL RESULTS\n");
  for (const r of results) {
    const icon = r.status === "PASS" ? "✓" : "✗";
    const time = r.responseTimeMs ? `${r.responseTimeMs}ms` : "—";
    const http = r.httpStatus ?? "—";
    console.log(`  ${icon} [${String(r.step).padStart(2, "0")}] ${r.name}`);
    console.log(`       ${r.method.padEnd(6)} ${r.url}  →  HTTP ${http}  (${time})`);
    if (r.note) console.log(`       Note   : ${r.note}`);
    if (r.error) console.log(`       Error  : ${r.error}`);
  }

  if (fails > 0) {
    console.log("\n" + "─".repeat(72));
    console.log("  FAILURES SUMMARY\n");
    for (const r of results.filter((r) => r.status === "FAIL")) {
      console.log(`  ✗ [${String(r.step).padStart(2, "0")}] ${r.name}`);
      console.log(`       ${r.error}`);
    }
  }

  console.log("\n" + "═".repeat(72));
  const verdict = fails === 0 ? "ALL TESTS PASSED ✓" : `${fails} TEST(S) FAILED ✗`;
  console.log(`  ${verdict}`);
  console.log("═".repeat(72) + "\n");
}

// ─── MAIN ──────────────────────────────────────────────────────────────────────
async function main() {
  const suiteStart = Date.now();

  console.log("\n" + "═".repeat(72));
  console.log("  SFDX API TESTER");
  console.log(`  Base URL   : ${CONFIG.baseUrl}`);
  console.log(`  Project ID : ${CONFIG.projectId}`);
  console.log("═".repeat(72) + "\n");

  // ── 1. Health check ───────────────────────────────────────────────────────
  console.log("▶  HEALTH CHECK");
  await run("Health check", "GET", "/health", { authenticated: false });

  // ── 2. List objects (baseline — may be empty) ─────────────────────────────
  console.log("\n▶  LIST OBJECTS (baseline)");
  await run("List all objects (baseline)", "GET", "/metadata/objects", {
    note: "Baseline — may return empty list",
  });

  // ── 3. Create objects ─────────────────────────────────────────────────────
  console.log("\n▶  CREATE OBJECTS");
  for (const obj of TEST_OBJECTS) {
    await run(`Create object: ${obj.fullName}`, "POST", "/metadata/objects", { body: obj });
  }

  // ── 4. List objects (should now include test objects) ─────────────────────
  console.log("\n▶  LIST OBJECTS (after creation)");
  await run("List all objects (post-create)", "GET", "/metadata/objects");

  // ── 5. Get objects by API name ────────────────────────────────────────────
  console.log("\n▶  GET OBJECTS BY API NAME");
  for (const obj of TEST_OBJECTS) {
    await run(`Get object by name: ${obj.fullName}`, "GET", `/metadata/objects/${obj.fullName}`);
  }

  // ── 6. Update objects ─────────────────────────────────────────────────────
  console.log("\n▶  UPDATE OBJECTS");
  for (const obj of TEST_OBJECTS) {
    const updated = {
      ...obj,
      description: `${obj.description} [UPDATED]`,
      enableHistory: true,
      enableFeeds: true,
    };
    await run(`Update object: ${obj.fullName}`, "PUT", `/metadata/objects/${obj.fullName}`, {
      body: updated,
    });
  }

  // ── 7. Get objects by API name (verify updates) ───────────────────────────
  console.log("\n▶  GET OBJECTS BY API NAME (verify updates)");
  for (const obj of TEST_OBJECTS) {
    await run(`Get updated object: ${obj.fullName}`, "GET", `/metadata/objects/${obj.fullName}`, {
      note: "Verify description updated",
    });
  }

  // ── 8. Create fields ──────────────────────────────────────────────────────
  console.log("\n▶  CREATE FIELDS");
  for (const [objectName, fields] of Object.entries(TEST_FIELDS)) {
    for (const field of fields) {
      const f = field as Record<string, unknown>;
      await run(`Create field: ${objectName}.${f.fullName}`, "POST", "/metadata/fields", {
        body: { objectName, field: f },
      });
    }
  }

  // ── 9. Update fields ──────────────────────────────────────────────────────
  console.log("\n▶  UPDATE FIELDS");
  for (const [objectName, fields] of Object.entries(TEST_FIELDS)) {
    for (const field of fields) {
      const f = field as Record<string, unknown>;
      const updated = { ...f, description: `${f.description ?? f.label} [UPDATED]`, inlineHelpText: "Auto-test updated field" };
      await run(`Update field: ${objectName}.${f.fullName}`, "PUT", `/metadata/fields/${objectName}/${f.fullName}`, {
        body: { field: updated },
      });
    }
  }

  // ── 10. Attempt to GET a non-existent object (expect 404) ────────────────
  console.log("\n▶  NEGATIVE TESTS");
  await run("Get non-existent object (expect 404)", "GET", "/metadata/objects/NonExistent__c", {
    expectStatus: 404,
    note: "Intentional — testing 404 handling",
  });

  // Attempt object update with mismatched fullName (expect 400)
  await run("Update object with mismatched fullName (expect 400)", "PUT", `/metadata/objects/${TEST_OBJECTS[0].fullName}`, {
    body: { ...TEST_OBJECTS[0], fullName: "Mismatch__c" },
    expectStatus: 400,
    note: "Intentional — testing body/param mismatch",
  });

  // ── 11. Delete fields ─────────────────────────────────────────────────────
  console.log("\n▶  DELETE FIELDS");
  for (const [objectName, fields] of Object.entries(TEST_FIELDS)) {
    for (const field of fields) {
      const f = field as Record<string, unknown>;
      await run(`Delete field: ${objectName}.${f.fullName}`, "DELETE", `/metadata/fields/${objectName}/${f.fullName}`);
    }
  }

  // ── 12. Delete objects ────────────────────────────────────────────────────
  console.log("\n▶  DELETE OBJECTS");
  for (const obj of TEST_OBJECTS) {
    await run(`Delete object: ${obj.fullName}`, "DELETE", `/metadata/objects/${obj.fullName}`);
  }

  // ── 13. Confirm deletion (expect 404) ────────────────────────────────────
  console.log("\n▶  CONFIRM DELETIONS (expect 404)");
  for (const obj of TEST_OBJECTS) {
    await run(`Confirm deleted: ${obj.fullName} (expect 404)`, "GET", `/metadata/objects/${obj.fullName}`, {
      expectStatus: 404,
      note: "Confirms object was successfully deleted",
    });
  }

  // ── Report ────────────────────────────────────────────────────────────────
  printReport(Date.now() - suiteStart);
}

main().catch((err) => {
  console.error("\nFatal error running test suite:", err);
  process.exit(1);
});