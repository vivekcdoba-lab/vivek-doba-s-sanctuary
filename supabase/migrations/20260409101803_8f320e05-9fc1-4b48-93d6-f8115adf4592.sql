
-- Enable extensions for scheduled jobs
CREATE EXTENSION IF NOT EXISTS pg_cron WITH SCHEMA pg_catalog;
CREATE EXTENSION IF NOT EXISTS pg_net WITH SCHEMA extensions;

-- Function to delete closed sessions older than 30 days
CREATE OR REPLACE FUNCTION public.cleanup_old_sessions()
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  deleted_count integer;
BEGIN
  DELETE FROM public.user_sessions
  WHERE status = 'closed'
    AND login_at < now() - interval '30 days';
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$;

-- Function to get daily session report stats for yesterday
CREATE OR REPLACE FUNCTION public.get_daily_session_report()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  result jsonb;
  yesterday date := (now() - interval '1 day')::date;
BEGIN
  SELECT jsonb_build_object(
    'report_date', yesterday,
    'total_sessions', (SELECT count(*) FROM user_sessions WHERE login_at::date = yesterday),
    'unique_users', (SELECT count(DISTINCT user_id) FROM user_sessions WHERE login_at::date = yesterday),
    'avg_duration_minutes', (SELECT COALESCE(round(avg(duration_seconds)::numeric / 60, 1), 0) FROM user_sessions WHERE login_at::date = yesterday AND duration_seconds IS NOT NULL),
    'active_now', (SELECT count(*) FROM user_sessions WHERE status = 'active'),
    'logout_reasons', (
      SELECT COALESCE(jsonb_object_agg(reason, cnt), '{}'::jsonb)
      FROM (
        SELECT COALESCE(logout_reason, 'unknown') as reason, count(*) as cnt
        FROM user_sessions WHERE login_at::date = yesterday AND status = 'closed'
        GROUP BY logout_reason
      ) sub
    ),
    'top_users', (
      SELECT COALESCE(jsonb_agg(row_to_json(t)), '[]'::jsonb)
      FROM (
        SELECT p.full_name, p.role, count(*) as session_count,
               round(COALESCE(avg(us.duration_seconds), 0)::numeric / 60, 1) as avg_min
        FROM user_sessions us
        JOIN profiles p ON p.user_id = us.user_id
        WHERE us.login_at::date = yesterday
        GROUP BY p.full_name, p.role
        ORDER BY session_count DESC
        LIMIT 10
      ) t
    )
  ) INTO result;
  RETURN result;
END;
$$;
