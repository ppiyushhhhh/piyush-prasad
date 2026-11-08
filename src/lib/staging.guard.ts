/**
 * Staging Environment Configuration & Production Isolation Guard
 * 
 * Strict safety rules:
 * 1. Staging never mutates or drops production Supabase tables/records.
 * 2. Staging never dispatches real transactional or notification emails.
 * 3. Staging never exposes production credentials or affects live traffic.
 */

export type AppEnvironment = "development" | "staging" | "production";

export function getAppEnvironment(): AppEnvironment {
  // 1. Client-side / Vite environment
  try {
    if (typeof import.meta !== "undefined" && import.meta.env) {
      if (
        import.meta.env["VITE_APP_ENV"] === "staging" ||
        import.meta.env["MODE"] === "staging"
      ) {
        return "staging";
      }
      if (
        import.meta.env["MODE"] === "production" ||
        import.meta.env["VITE_APP_ENV"] === "production"
      ) {
        return "production";
      }
    }
  } catch {
    // ignore
  }

  // 2. Server-side / Node.js runtime
  try {
    if (typeof process !== "undefined" && process.env) {
      const envVal =
        process.env["VITE_APP_ENV"] ||
        process.env["APP_ENV"] ||
        process.env["NODE_ENV"];
      if (envVal === "staging") {
        return "staging";
      }
      if (envVal === "production") {
        return "production";
      }
    }
  } catch {
    // ignore
  }

  return "development";
}

export const isStaging = getAppEnvironment() === "staging";
export const isProduction = getAppEnvironment() === "production";
export const isDevelopment = getAppEnvironment() === "development";

export const PRODUCTION_SUPABASE_PROJECT_ID = "xseiuzpzzfvtrkmohogn";
export const PRODUCTION_DOMAIN = "piyushprasad.in";
export const STAGING_DOMAIN = "test.piyushprasad.in";
export const LOCAL_STAGING_PORT = 3001;

/**
 * Checks if the current Supabase configuration points to the production database.
 */
export function isUsingProductionSupabase(): boolean {
  let url = "";
  try {
    if (typeof import.meta !== "undefined" && import.meta.env) {
      url = import.meta.env["VITE_SUPABASE_URL"] || "";
    }
  } catch {
    // ignore
  }
  if (!url && typeof process !== "undefined" && process.env) {
    url = process.env["SUPABASE_URL"] || process.env["VITE_SUPABASE_URL"] || "";
  }
  return url.includes(PRODUCTION_SUPABASE_PROJECT_ID);
}

/**
 * Strict Staging Isolation Guard.
 * Throws an explicit error if a write/mutation operation is attempted against
 * the production Supabase database while running in staging mode.
 */
export function assertStagingWriteAllowed(operationDescription: string): void {
  if (isStaging && isUsingProductionSupabase()) {
    const errorMsg = `[STAGING ISOLATION GUARD] Blocked mutation '${operationDescription}'. Staging is running with production Supabase connection fallback. To enable writes in staging, configure a dedicated staging Supabase project (see .env.staging.example).`;
    console.error(errorMsg);
    throw new Error(errorMsg);
  }
}

/**
 * Diagnostic banner to log staging status and verify isolation on initialization.
 */
let hasLoggedDiagnostics = false;
export function logStagingDiagnostics(): void {
  if (hasLoggedDiagnostics) return;
  hasLoggedDiagnostics = true;

  if (isStaging) {
    const usingProdDb = isUsingProductionSupabase();
    console.info(`
===================================================================
 [STAGING ENVIRONMENT INITIALIZED]
 Environment:   STAGING (MODE=staging)
 Local Target:  http://localhost:${LOCAL_STAGING_PORT}
 Future Domain: https://${STAGING_DOMAIN}
 Database:      ${usingProdDb ? "READ-ONLY FALLBACK (Production writes blocked)" : "DEDICATED STAGING BACKEND"}
 Email System:  SIMULATED / INTERCEPTED (Zero live emails dispatched)
 Robots Meta:   noindex, nofollow (Search engine indexing blocked)
 Production:    ISOLATED & SECURE
===================================================================
`);
  }
}

