# Piyush Prasad — Portfolio + Datadog Observability

Personal portfolio for **Piyush Prasad** (Aspiring Cloud & DevOps Engineer), deployed on Vercel at **https://piyushprasad.in**, instrumented end‑to‑end with **Datadog Browser RUM** and **Datadog Synthetic Monitoring**.

This README documents the observability work already completed and the operational runbook (dashboard + monitors) that turns the portfolio into a small but production‑style DevOps project.

---

## 1. Stack

- **Frontend:** React 19 + TanStack Start (Vite 7), Tailwind CSS v4
- **Hosting:** Vercel (auto‑deploy on push to `main`)
- **Monitoring:** Datadog Browser RUM + Synthetic Monitoring (US5 site)
- **Source of truth for RUM init:** [`src/lib/datadog.ts`](./src/lib/datadog.ts)

---

## 2. Completed Work

- [x] Created a Datadog account (US5 — `us5.datadoghq.com`).
- [x] Created a Browser RUM application (`portfolio`).
- [x] Integrated the Datadog Browser RUM SDK (`@datadog/browser-rum` + `@datadog/browser-rum-react`) into the React app.
- [x] Deployed the updated application to Vercel.
- [x] Verified RUM sessions and user activity are flowing into Datadog.
- [x] Created a **Synthetic HTTP Uptime Monitor** for `https://piyushprasad.in`.
- [x] Created a **Synthetic HTTP Response Time Monitor** for `https://piyushprasad.in`.
- [x] Both synthetic monitors are healthy at 100% uptime.

### RUM configuration in use

Defined in [`src/lib/datadog.ts`](./src/lib/datadog.ts):

| Setting | Value |
| --- | --- |
| `service` | `portfolio` |
| `env` | `production` |
| `version` | `1.0.0` |
| `site` | `us5.datadoghq.com` |
| `sessionSampleRate` | `100` |
| `sessionReplaySampleRate` | `20` |
| `trackUserInteractions` | `true` |
| `trackResources` | `true` |
| `trackLongTasks` | `true` |
| `defaultPrivacyLevel` | `mask-user-input` |
| Plugins | `reactPlugin()` |

Session Replay is started via `datadogRum.startSessionReplayRecording()`.

---

## 3. Next Steps — Infrastructure Monitoring Dashboard

These steps are performed in the Datadog UI (they are not code changes). Follow them in order.

### 3.1 Create the dashboard

1. Datadog → **Dashboards → New Dashboard → New Timeboard**.
2. Name: **Portfolio — Production Monitoring (piyushprasad.in)**.
3. Description: *"Uptime, latency, availability, and SSL health for the portfolio site."*
4. Set the **default time range** to `Past 4 Hours` and enable **Global time selector**.

### 3.2 Create the required Synthetic tests

Two synthetic tests already exist (uptime + response time). Add two more so every dashboard widget has a data source.

| # | Test | Type | URL | Assertions | Frequency | Locations |
| - | --- | --- | --- | --- | --- | --- |
| 1 | Website Uptime *(existing)* | HTTP | `https://piyushprasad.in` | `status is 200` | 1 min | 3+ global |
| 2 | Response Time *(existing)* | HTTP | `https://piyushprasad.in` | `response time < 2000 ms` | 1 min | 3+ global |
| 3 | **Homepage Availability** | Browser Test | `https://piyushprasad.in` | Element `h1` is present, page text contains `"Piyush Prasad"` | 5 min | 2+ global |
| 4 | **SSL Certificate Status** | SSL | `piyushprasad.in:443` | `Certificate expires in more than 30 days`, `Certificate is valid` | 1 hour | 1 global |

Tag every test with `service:portfolio`, `env:production`, `owner:piyush`.

### 3.3 Add the widgets

Use this layout — two rows of two widgets — for a clean production feel:

```text
┌──────────────────────────┬──────────────────────────┐
│ Website Uptime (%)       │ Response Time (p50/p95)  │
│  Query Value + Timeseries│  Timeseries              │
├──────────────────────────┼──────────────────────────┤
│ Homepage Availability    │ SSL Certificate Status   │
│  Check Status widget     │  Query Value (days left) │
└──────────────────────────┴──────────────────────────┘
```

**Widget 1 — Website Uptime**
- Type: *Query Value* + small *Timeseries* underneath.
- Metric: `synthetics.http.response.status` filtered by the Uptime test, or use the **Synthetic Test Status** widget bound to the Uptime test.
- Formula: `100 * (successful_runs / total_runs)` over the selected time range.
- Why: single‑number KPI showing whether the site is reachable — the first thing an SRE checks.

**Widget 2 — Response Time**
- Type: *Timeseries*.
- Metric: `synthetics.http.response.time` from the Response Time test, plotted as `p50` and `p95`.
- Threshold marker at `2000 ms` (matches the alert threshold below).
- Why: latency trend over time; spikes here usually precede user‑visible slowness in RUM.

**Widget 3 — Homepage Availability**
- Type: *Check Status* (or *Synthetic Test Status*) bound to the Homepage Availability browser test.
- Why: uptime only proves `HTTP 200`; a browser test proves the page actually rendered with the expected content (guards against blank deploys / broken JS bundles).

**Widget 4 — SSL Certificate Status**
- Type: *Query Value* showing **days until expiry** from the SSL synthetic test, with a conditional format: green > 30, yellow 8–30, red ≤ 7.
- Why: an expired cert = full outage; this widget makes renewal impossible to forget.

Optional bonus row (nice on a DevOps portfolio):
- **RUM — Active Sessions (last 15m)** from `@type:session` events.
- **RUM — Core Web Vitals** (LCP, INP, CLS) as three query values.
- **RUM — JS Errors / min** timeseries.

---

## 4. Email Alerts

Datadog → **Monitors → New Monitor**. Set **Notify your team → `@piyush.piyushprasad.in`** (or your verified email handle) on each.

| Monitor | Type | Condition | Threshold | Renotify | Priority |
| --- | --- | --- | --- | --- | --- |
| **Website Down** | Synthetic (Uptime test) | Test is `failing` | 2 consecutive failures | Every 30 min while triggered | P1 |
| **Response Time High** | Synthetic (Response Time test) | `response time > 2000 ms` | 3 out of last 5 runs | Every 1 hour | P2 |
| **SSL Expiring Soon** | Synthetic (SSL test) | `days_until_expiration < 30` | 1 failure | Daily | P2 |

Message template (reuse for all three):

```text
{{#is_alert}}
🚨 [{{env.name}}] {{monitor.name}} is FAILING
Host: piyushprasad.in
Details: {{value}} — {{monitor.message}}
{{/is_alert}}
{{#is_recovery}}
✅ Recovered: {{monitor.name}}
{{/is_recovery}}
Notify: @piyush.piyushprasad.in
```

Tag each monitor `service:portfolio`, `env:production`.

---

## 5. Why This Setup Matters (interview‑ready summary)

- **RUM** gives real user data — what your visitors actually experience (load time, errors, rage clicks). Synthetic gives you a *baseline* from a controlled location; RUM tells you what real people see. You need both.
- **Uptime + Homepage Availability** are complementary: HTTP 200 ≠ working page. The browser test catches the failure mode where the CDN serves an empty shell.
- **Response Time p95** (not average) is the industry standard because averages hide the slow tail that actually annoys users.
- **SSL monitoring** prevents the single most embarrassing DevOps outage — an expired certificate — with zero ongoing effort.
- **Email alerts with renotify** ensure a failure keeps paging until it's acknowledged, which mirrors how on‑call rotations work at real companies.

---

## 6. Local Development

```bash
bun install
bun dev
```

Set the following env vars (optional — RUM is a no‑op without them):

```bash
VITE_DATADOG_APPLICATION_ID=...
VITE_DATADOG_CLIENT_TOKEN=...
VITE_DATADOG_SITE=us5.datadoghq.com
```

---

## 7. Links

- **Live site:** https://piyushprasad.in
- **Resume:** https://piyushprasad.in/resume
- **LinkedIn:** https://www.linkedin.com/in/piyush-prasad
- **GitHub:** https://github.com/piyushprasad
