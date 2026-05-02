ALTER TABLE public.user_sessions
  ADD COLUMN IF NOT EXISTS fingerprint_hash text;

CREATE INDEX IF NOT EXISTS idx_user_sessions_fingerprint
  ON public.user_sessions (fingerprint_hash)
  WHERE status = 'active';

CREATE OR REPLACE FUNCTION public.close_inactive_sessions()
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  closed_seeker integer;
  closed_other integer;
  abs_count integer;
BEGIN
  UPDATE public.user_sessions
  SET status = 'closed',
      logout_reason = COALESCE(logout_reason, 'auto'),
      logout_at = now(),
      duration_seconds = EXTRACT(EPOCH FROM (now() - login_at))::integer
  WHERE status = 'active'
    AND role = 'seeker'
    AND last_activity_at < now() - interval '30 minutes';
  GET DIAGNOSTICS closed_seeker = ROW_COUNT;

  UPDATE public.user_sessions
  SET status = 'closed',
      logout_reason = COALESCE(logout_reason, 'auto'),
      logout_at = now(),
      duration_seconds = EXTRACT(EPOCH FROM (now() - login_at))::integer
  WHERE status = 'active'
    AND (role IS NULL OR role IN ('admin', 'coach'))
    AND last_activity_at < now() - interval '60 minutes';
  GET DIAGNOSTICS closed_other = ROW_COUNT;

  UPDATE public.user_sessions
  SET status = 'closed',
      logout_reason = 'absolute_timeout',
      logout_at = now(),
      duration_seconds = EXTRACT(EPOCH FROM (now() - login_at))::integer
  WHERE status = 'active'
    AND login_at < now() - interval '12 hours';
  GET DIAGNOSTICS abs_count = ROW_COUNT;

  RETURN closed_seeker + closed_other + abs_count;
END;
$function$;