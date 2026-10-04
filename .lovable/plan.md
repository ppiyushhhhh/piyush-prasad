
## Goal

Redesign only the PDF generation inside `scripts/generate-report.mjs`. Data collection (HTTP, SSL, DNS, Lighthouse, assets), scoring, email delivery, and the GitHub Actions workflow stay exactly as they are.

## What changes

Only the PDF-rendering half of `scripts/generate-report.mjs`:
- `generatePdf()` and every helper it calls (`drawHeader`, `drawFooter`, `sectionTitle`, `drawScoreBadge`, `drawSummaryCard`, `drawSummaryGrid`, `drawLighthouseGrid`, `drawMetricsTable`, plus new helpers).
- A small, new `collectGitInfo()` helper that reads GitHub Actions env vars (`GITHUB_REPOSITORY`, `GITHUB_REF_NAME`, `GITHUB_SHA`, `GITHUB_WORKFLOW`, `GITHUB_RUN_ID`, `GITHUB_SERVER_URL`, `GITHUB_ACTOR`, `GITHUB_EVENT_NAME`) and, when available, shells out to `git log -1` for commit message/author/date. All fields degrade gracefully to `—` when running locally. This is metadata only — it does not touch monitoring logic.
- `data` gets a `git` block populated from that helper before `generatePdf` is called.

Nothing else in the file is touched: collectors, `computeHealthScore`, `buildRecommendations`, `sendReportEmail`, `sendFailureAlert`, and `main()` stay unchanged aside from the one new `data.git = collectGitInfo()` line.

## New 2-page layout (A4 portrait, 36 pt margin)

Consistent visual system:
- White background, navy (`#0B1F3A`) section headers with cobalt underline accent.
- Light-gray (`#F5F7FB`) rounded info cards, 6 pt radius.
- Status colors: green `#16A34A` / orange `#D97706` / red `#DC2626`.
- Typography: Helvetica-Bold for headings and metric values, Helvetica for labels; 8 pt small-caps labels, 12 pt values, 9.5 pt body.
- Fixed vertical rhythm (14 pt between sections, 8 pt inside cards) — no free-floating `doc.y` drift, so nothing overflows.

### Page 1 — Overview

```text
┌───────────────────────────────────────────────────────────┐
│ [PP] Piyush Prasad · piyushprasad.in     REPORT · date/time│
├───────────────────────────────────────────────────────────┤
│ Daily Website Health Report                                │
│ Portfolio Monitoring Report · v2.1                         │
│                                                            │
│ URL  ·  Date  ·  Time  ·  Version   (single info strip)    │
│                                                            │
│ EXECUTIVE SUMMARY  ───                                     │
│ ┌──────────┐  ┌─────────────┬─────────────┬─────────────┐  │
│ │  Health  │  │ Website     │ HTTP Status │ Response    │  │
│ │   87     │  │ Online      │ 200         │ 412 ms      │  │
│ │ Healthy  │  ├─────────────┼─────────────┼─────────────┤  │
│ └──────────┘  │ SSL Status  │ SSL Expiry  │ DNS Status  │  │
│               │ Valid       │ 71 days     │ Resolved    │  │
│               └─────────────┴─────────────┴─────────────┘  │
│                                                            │
│ LIGHTHOUSE SUMMARY  ───                                    │
│ ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐                │
│ │ Perf   │ │ A11y   │ │ BestPr │ │ SEO    │                │
│ │  94    │ │  98    │ │  100   │ │  100   │                │
│ └────────┘ └────────┘ └────────┘ └────────┘                │
└───────────────────────────────────────────────────────────┘
```

- Removes the redundant "Executive Summary" prose paragraph (URL/date are already in the header and info strip).
- Asset Availability moves off page 1 (it was optional and produced whitespace when everything was healthy).

### Page 2 — Diagnostics

```text
┌───────────────────────────────────────────────────────────┐
│ [PP] header (same as page 1)                              │
├───────────────────────────────────────────────────────────┤
│ PERFORMANCE METRICS  ───                                  │
│ ┌───────────────────────────────┬──────────────────────┐  │
│ │ First Contentful Paint        │ 0.8 s                │  │
│ │ Largest Contentful Paint      │ 1.4 s                │  │
│ │ Total Blocking Time           │ 20 ms                │  │
│ │ Cumulative Layout Shift       │ 0.02                 │  │
│ │ Speed Index                   │ 1.1 s                │  │
│ └───────────────────────────────┴──────────────────────┘  │
│                                                            │
│ GITHUB INFORMATION  ───         DEPLOYMENT  ───            │
│ ┌───────────────────────────┐   ┌───────────────────────┐  │
│ │ Repository   user/repo    │   │ Status     Success    │  │
│ │ Branch       main         │   │ Workflow   Daily …    │  │
│ │ Commit       9f3a1c2      │   │ Generated  2026-…     │  │
│ │ Message      Fix header … │   └───────────────────────┘  │
│ │ Author       Piyush P.    │                              │
│ │ Committed    2026-…       │                              │
│ └───────────────────────────┘                              │
│                                                            │
│ RECOMMENDATIONS  ───                                       │
│ • up to 5–8 bullets, single line each, ellipsis if long    │
│                                                            │
│ Footer: Generated by GitHub Actions · piyushprasad.in ·   │
│         github.com/<repo> · <ISO date>          Page 2/2  │
└───────────────────────────────────────────────────────────┘
```

- Two side-by-side info tables (GitHub | Deployment) share one row so both fit without a third page.
- Empty-section guard: if `data.git` has no repository info **and** no commit info, both the GitHub and Deployment blocks are hidden and Recommendations shifts up (no blank space).
- Recommendations are hard-capped at what fits above the footer — same "measure then break" loop that's already there, tightened to `PAGE.h - 90` and single-line `height` per bullet with ellipsis.

## Guarantees kept

- Existing 2-page assertions stay: pre-`doc.end()` `bufferedPageRange().count === 2` check plus the post-write `/Type /Page` re-parse. Any regression that would produce 3+ pages or a blank still throws.
- No new npm dependencies.
- `computeHealthScore`, `buildRecommendations`, all collectors, `sendReportEmail`, `sendFailureAlert`, and `.github/workflows/daily-report.yml` are untouched.

## Technical notes

- `collectGitInfo()` uses `spawnSync("git", ["log", "-1", "--pretty=format:%h%x1f%an%x1f%ad%x1f%s", "--date=iso-strict"])` inside a try/catch; if git is absent it returns `null` for those fields. Repository / branch / workflow / run URL come from env vars, which are always set on GitHub Actions.
- Commit message is truncated to ~70 chars with ellipsis before rendering so the card stays single-line.
- Report Version bumps to `2.1` to reflect the new layout.
- No emojis, no gradients, no placeholder rows — sections with all-empty values are skipped by `if` guards rather than rendered blank.
