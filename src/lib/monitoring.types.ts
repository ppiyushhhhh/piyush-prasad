export type MonitoringJson =
  | string
  | number
  | boolean
  | null
  | { [key: string]: MonitoringJson | undefined }
  | MonitoringJson[];

export type HealthCheck = {
  id: string;
  checked_at: string;
  url: string;
  http_status: number | null;
  response_time_ms: number | null;
  ssl_valid: boolean | null;
  ssl_expires_at: string | null;
  dns_ok: boolean | null;
  robots_ok: boolean | null;
  sitemap_ok: boolean | null;
  favicon_ok: boolean | null;
  health_score: number | null;
  details: Record<string, MonitoringJson> | null;
};

export type PerformanceRow = {
  id: string;
  measured_at: string;
  url: string;
  performance: number | null;
  accessibility: number | null;
  best_practices: number | null;
  seo: number | null;
  details?: Record<string, MonitoringJson> | null;
};

export type DeploymentRow = {
  id: string;
  occurred_at: string;
  provider: string | null;
  workflow_name: string | null;
  status: string | null;
  conclusion: string | null;
  commit_sha: string | null;
  duration_seconds: number | null;
  url: string | null;
};

export type ChatActivityRow = {
  id: string;
  occurred_at: string;
  event_type: string;
  message_count: number | null;
  latency_ms: number | null;
  error_code: string | null;
};

export type ReportRow = {
  id: string;
  report_date: string;
  health_score: number | null;
  lighthouse_score: number | null;
  status: string | null;
  pdf_url: string | null;
  created_at: string;
};

export type OverviewData = {
  health: HealthCheck | null;
  performance: PerformanceRow | null;
  deployment: DeploymentRow | null;
  report: ReportRow | null;
  chatCount24h: number | null;
};
