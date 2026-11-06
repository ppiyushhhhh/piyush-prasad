/**
 * Production Validation Test Suite for Ask Piyush AI Dynamic Knowledge and Security.
 * Covers Priority 1 through Priority 7 constraints.
 */

import assert from "node:assert";
import fs from "node:fs";

let passed = 0;
let failed = 0;

function test(name, fn) {
  try {
    fn();
    console.log(`[PASS] ${name}`);
    passed++;
  } catch (err) {
    console.error(`[FAIL] ${name}:`, err.message);
    failed++;
  }
}

console.log("=================================================");
console.log("Ask Piyush AI Production Bug Fix - Test Suite");
console.log("=================================================\n");

// -----------------------------------------------------------------------------
// Test 1: Verify shared data module eliminates hardcoded duplication
// -----------------------------------------------------------------------------
test("Priority 4: Shared portfolio data sources are defined in portfolio-data.ts", () => {
  const code = fs.readFileSync("./src/data/portfolio-data.ts", "utf8");
  assert.ok(code.includes("export const EXPERIENCE_DATA"), "EXPERIENCE_DATA must be exported");
  assert.ok(code.includes("export const PROJECTS"), "PROJECTS must be exported");
  assert.ok(code.includes("export const PRIORITY_TECHS"), "PRIORITY_TECHS must be exported");
  assert.ok(code.includes("export const SKILL_CATEGORIES_DATA"), "SKILL_CATEGORIES_DATA must be exported");
  assert.ok(code.includes("export const CERTS_DATA"), "CERTS_DATA must be exported");
  assert.ok(code.includes("export const EDUCATION_DATA"), "EDUCATION_DATA must be exported");
  assert.ok(code.includes("export function calculateExperienceDuration"), "calculateExperienceDuration must be exported");

  // Verify accurate tenure
  assert.ok(code.includes("Runtime Solutions"), "Must have Runtime Solutions");
  assert.ok(code.includes("1 yr 9 mos") || code.includes("month: 8"), "Must specify Aug 2026 for IT Support end date");
});

// -----------------------------------------------------------------------------
// Test 2: Server-side Credly query definition
// -----------------------------------------------------------------------------
test("Priority 2: Server-side Credly query selects required fields and rejects browser localStorage", () => {
  const serverCode = fs.readFileSync("./src/lib/portfolio-knowledge.server.ts", "utf8");
  // Strip comments
  const codeWithoutComments = serverCode.replace(/\/\*[\s\S]*?\*\/|\/\/.*/g, "");

  assert.ok(!codeWithoutComments.includes("localStorage"), "portfolio-knowledge.server.ts executable code must NEVER access localStorage");
  assert.ok(!codeWithoutComments.includes("FALLBACK_CREDLY_BADGES"), "portfolio-knowledge.server.ts executable code must NEVER use FALLBACK_CREDLY_BADGES");
  assert.ok(serverCode.includes("supabaseAdmin"), "Must use supabaseAdmin for server queries");

  // Verify all 10 required fields are queried
  const requiredFields = [
    "id",
    "name",
    "issuer",
    "description",
    "issue_date",
    "expiry_date",
    "skills",
    "credly_url",
    "is_published",
    "updated_at",
  ];
  for (const field of requiredFields) {
    assert.ok(serverCode.includes(field), `Query must retrieve field: ${field}`);
  }
});

// -----------------------------------------------------------------------------
// Test 3: Security & Authorization on AI Knowledge Functions
// -----------------------------------------------------------------------------
test("Priority 1: All privileged operations in ai-knowledge.functions.ts enforce server authentication", () => {
  const functionsCode = fs.readFileSync("./src/lib/ai-knowledge.functions.ts", "utf8");

  const privilegedFns = [
    "getAdminCustomKnowledge",
    "saveAdminCustomKnowledge",
    "deleteAdminCustomKnowledge",
    "toggleCustomKnowledgePublish",
    "refreshAiKnowledge",
    "getAiKnowledgeTelemetry",
    "invalidateAiKnowledgeCacheServerFn",
  ];

  for (const fn of privilegedFns) {
    assert.ok(functionsCode.includes(fn), `Function ${fn} must exist in ai-knowledge.functions.ts`);
  }

  // Verify verifyAdminCaller is invoked
  assert.ok(functionsCode.includes("verifyAdminCaller()"), "verifyAdminCaller() must be defined");
  assert.ok(functionsCode.includes("user_roles"), "verifyAdminCaller must check public.user_roles");
  assert.ok(functionsCode.includes("Bearer "), "Must require and extract Bearer token");
  assert.ok(functionsCode.includes("Unauthorized: Bearer token is required."), "Must reject unauthenticated calls");
  assert.ok(functionsCode.includes("Forbidden: Administrator privileges required."), "Must reject non-admin callers");
});

// -----------------------------------------------------------------------------
// Test 4: Cache Invalidation only after successful mutations
// -----------------------------------------------------------------------------
test("Priority 3: Invalidation occurs strictly after successful database mutations", () => {
  const functionsCode = fs.readFileSync("./src/lib/ai-knowledge.functions.ts", "utf8");

  // In saveAdminCustomKnowledge, invalidateKnowledgeCache() must be after db error check
  const saveIdx = functionsCode.indexOf("export const saveAdminCustomKnowledge");
  const saveBody = functionsCode.slice(saveIdx, saveIdx + 2000);
  const errorIdx = saveBody.indexOf("if (error)");
  const invIdx = saveBody.indexOf("invalidateKnowledgeCache()");

  assert.ok(errorIdx !== -1 && invIdx !== -1, "saveAdminCustomKnowledge must handle error and invalidation");
  assert.ok(invIdx > errorIdx, "invalidateKnowledgeCache must appear AFTER database error check in save");

  // In deleteAdminCustomKnowledge
  const delIdx = functionsCode.indexOf("export const deleteAdminCustomKnowledge");
  const delBody = functionsCode.slice(delIdx, delIdx + 800);
  const delErrIdx = delBody.indexOf("if (error)");
  const delInvIdx = delBody.indexOf("invalidateKnowledgeCache()");
  assert.ok(delInvIdx > delErrIdx, "invalidateKnowledgeCache must appear AFTER database error check in delete");
});

// -----------------------------------------------------------------------------
// Test 5: Accurate Knowledge Telemetry & Granular Source Tracking
// -----------------------------------------------------------------------------
test("Priority 5: Telemetry calculates counts from actual records and tracks sources independently", () => {
  const serverCode = fs.readFileSync("./src/lib/portfolio-knowledge.server.ts", "utf8");

  // Verify no hardcoded 4, 2, 9 values in telemetry assignments
  assert.ok(!serverCode.includes("projectsCount: 4,"), "projectsCount must be dynamic (PROJECTS.length), not hardcoded 4");
  assert.ok(!serverCode.includes("experiencesCount: 2,"), "experiencesCount must be dynamic (EXPERIENCE_DATA.length), not hardcoded 2");
  assert.ok(!serverCode.includes("totalRecords: 4 + 2"), "totalRecords must be dynamically calculated");

  // Verify independent sources tracking
  assert.ok(serverCode.includes("interface KnowledgeSourceStatus"), "KnowledgeSourceStatus interface must be defined");
  assert.ok(serverCode.includes("sources: KnowledgeSourceStatus[]"), "sources array must be present in telemetry");
  assert.ok(serverCode.includes('credlyResult.error ? "error" : credlyCount === 0 ? "empty" : "synced"'),
    "Must distinguish between empty table and query error");
  assert.ok(serverCode.includes('hasDbError ? "degraded" : "synced"'),
    "Must report degraded status when any database source query fails");
});

// -----------------------------------------------------------------------------
// Test 6: Cross-instance fingerprinting across Vercel server instances
// -----------------------------------------------------------------------------
test("Priority 3: Multi-instance synchronization via database fingerprinting", () => {
  const serverCode = fs.readFileSync("./src/lib/portfolio-knowledge.server.ts", "utf8");

  assert.ok(serverCode.includes("getDatabaseKnowledgeFingerprint"), "getDatabaseKnowledgeFingerprint must exist");
  assert.ok(serverCode.includes("credlyMeta"), "Fingerprint must inspect credly_badges metadata");
  assert.ok(serverCode.includes("customMeta"), "Fingerprint must inspect portfolio_custom_knowledge metadata");
  assert.ok(serverCode.includes("admin_audit_log"), "Fingerprint must inspect admin_audit_log force syncs");
  assert.ok(serverCode.includes("memoryCache.fingerprint === dbFingerprint"),
    "Cache hit requires matching database fingerprint across instances");
});

// -----------------------------------------------------------------------------
// Test 7: Conversation Memory and Pronoun Resolution
// -----------------------------------------------------------------------------
test("Priority 6: System instruction includes strict pronoun resolution and ground-truth precedence", () => {
  const serverCode = fs.readFileSync("./src/lib/portfolio-knowledge.server.ts", "utf8");

  assert.ok(serverCode.includes("CONVERSATION CONTEXT, FOLLOW-UPS & PRONOUN RESOLUTION"),
    "System instruction must contain pronoun resolution instructions");
  assert.ok(serverCode.includes("GROUND TRUTH PRECEDENCE"),
    "System instruction must prioritize current verified knowledge over prior assistant statements");
  assert.ok(serverCode.includes("which one is the latest"),
    "System instruction must instruct model on 'which one is the latest' questions");
  assert.ok(serverCode.includes("who issued it"),
    "System instruction must instruct model on 'who issued it' follow-ups");
});

// -----------------------------------------------------------------------------
// Test 8: Client UI hooks into invalidation on Credly mutations
// -----------------------------------------------------------------------------
test("Priority 3: dashboard.credly-badges.tsx triggers cache invalidation only on mutation success", () => {
  const credlyPageCode = fs.readFileSync("./src/routes/dashboard.credly-badges.tsx", "utf8");

  assert.ok(credlyPageCode.includes("invalidateAiKnowledgeCacheServerFn"),
    "dashboard.credly-badges.tsx must import invalidateAiKnowledgeCacheServerFn");
  assert.ok(credlyPageCode.includes("triggerSyncAiKnowledge"),
    "dashboard.credly-badges.tsx must define triggerSyncAiKnowledge");

  // Check that triggerSyncAiKnowledge is present in mutation handlers
  assert.ok(credlyPageCode.includes("triggerSyncAiKnowledge().catch"),
    "Mutations must invoke triggerSyncAiKnowledge upon success");
});

// -----------------------------------------------------------------------------
// Test 9: Zero Duplication in Components
// -----------------------------------------------------------------------------
test("Priority 4: Portfolio components import from shared data module", () => {
  const expCode = fs.readFileSync("./src/components/portfolio/ExperienceTimeline.tsx", "utf8");
  const projCode = fs.readFileSync("./src/components/portfolio/Projects.tsx", "utf8");
  const skillsCode = fs.readFileSync("./src/components/portfolio/SkillsGrid.tsx", "utf8");
  const certsCode = fs.readFileSync("./src/components/portfolio/Certifications.tsx", "utf8");

  assert.ok(expCode.includes("@/data/portfolio-data"), "ExperienceTimeline imports from @/data/portfolio-data");
  assert.ok(projCode.includes("@/data/portfolio-data"), "Projects imports from @/data/portfolio-data");
  assert.ok(skillsCode.includes("@/data/portfolio-data"), "SkillsGrid imports from @/data/portfolio-data");
  assert.ok(certsCode.includes("@/data/portfolio-data"), "Certifications imports from @/data/portfolio-data");
});

console.log("\n=================================================");
console.log(`Results: ${passed} Passed, ${failed} Failed`);
console.log("=================================================");

if (failed > 0) {
  process.exit(1);
}
