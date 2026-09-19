# Wire live monitoring ingestion

## What will change
- Extend the existing secure monitoring endpoint to accept privacy-safe AI chat telemetry alongside health, performance, report, and deployment events.
- Update the daily health-report script and workflow to submit each completed run’s health check, Lighthouse scores, and report summary to the dashboard.
- Add a Vercel deployment-status workflow that records real Vercel deployment results, commit details, duration when available, and deployment links.
- Route chat telemetry through the same authenticated ingestion contract while continuing to store only event type, counts, latency, and error codes—never messages or credentials.

## Security and reliability
- Keep the ingestion token server-side and in GitHub repository secrets only.
- Preserve all existing database tables, grants, and row-security policies.
- Validate every payload, use explicit timeouts, and make monitoring delivery failures visible without breaking the main report or chat response.
- Avoid mock or seeded dashboard records.

## Verification
- Run the report locally without email and validate its generated ingestion payload.
- Run type checking, linting, and the production build.
- Exercise the ingestion endpoint with unauthorized and valid requests, then verify new rows load through the dashboard data functions.
- Confirm all dashboard pages still render and that no sensitive values appear in browser code, responses, or logs.

## Required external configuration
- GitHub Actions must have `MONITORING_INGEST_URL` and the matching `MONITORING_INGEST_TOKEN` repository secrets. The URL will be the published app’s `/api/public/monitoring` address.
- Vercel deployment events will use GitHub’s deployment-status event, avoiding a Vercel access token where the existing Vercel GitHub integration emits those events.
