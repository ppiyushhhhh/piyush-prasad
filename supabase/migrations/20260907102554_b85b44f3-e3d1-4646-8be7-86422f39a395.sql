CREATE TYPE public.app_role AS ENUM ('admin', 'user');

CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can read own roles" ON public.user_roles FOR SELECT TO authenticated USING (user_id = auth.uid());

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;

-- One-time bootstrap: the first authenticated user may claim admin while no admin exists.
CREATE OR REPLACE FUNCTION public.claim_admin()
RETURNS boolean LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE has_admin boolean;
BEGIN
  IF auth.uid() IS NULL THEN RETURN false; END IF;
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE role = 'admin') INTO has_admin;
  IF has_admin THEN RETURN false; END IF;
  INSERT INTO public.user_roles (user_id, role) VALUES (auth.uid(), 'admin')
  ON CONFLICT DO NOTHING;
  RETURN true;
END;
$$;
GRANT EXECUTE ON FUNCTION public.claim_admin() TO authenticated;

CREATE TABLE public.website_health_checks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  checked_at timestamptz NOT NULL DEFAULT now(),
  url text NOT NULL,
  http_status integer,
  response_time_ms integer,
  ssl_valid boolean,
  ssl_expires_at timestamptz,
  dns_ok boolean,
  robots_ok boolean,
  sitemap_ok boolean,
  favicon_ok boolean,
  health_score integer,
  details jsonb
);

CREATE TABLE public.performance_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  measured_at timestamptz NOT NULL DEFAULT now(),
  url text NOT NULL,
  performance integer,
  accessibility integer,
  best_practices integer,
  seo integer,
  details jsonb
);

CREATE TABLE public.deployment_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  occurred_at timestamptz NOT NULL DEFAULT now(),
  provider text,
  workflow_name text,
  status text,
  conclusion text,
  commit_sha text,
  duration_seconds integer,
  url text
);

CREATE TABLE public.chat_activity (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  occurred_at timestamptz NOT NULL DEFAULT now(),
  event_type text NOT NULL,
  message_count integer,
  latency_ms integer,
  error_code text
);

CREATE TABLE public.health_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  report_date date NOT NULL,
  health_score integer,
  lighthouse_score integer,
  status text,
  pdf_url text,
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.website_health_checks, public.performance_history, public.deployment_history, public.chat_activity, public.health_reports TO authenticated;
GRANT ALL ON public.website_health_checks, public.performance_history, public.deployment_history, public.chat_activity, public.health_reports TO service_role;

ALTER TABLE public.website_health_checks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.performance_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.deployment_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_activity ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.health_reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can read health checks" ON public.website_health_checks FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can read performance" ON public.performance_history FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can read deployments" ON public.deployment_history FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can read chat activity" ON public.chat_activity FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can read reports" ON public.health_reports FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));