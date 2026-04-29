CREATE OR REPLACE FUNCTION public.close_inactive_sessions()
 RETURNS integer
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  closed_count integer;
  abs_count integer;
BEGIN
  -- Idle timeout: 15 minutes since last activity
  UPDATE public.user_sessions
  SET status = 'closed',
      logout_reason = COALESCE(logout_reason, 'auto'),
      logout_at = now(),
      duration_seconds = EXTRACT(EPOCH FROM (now() - login_at))::integer
  WHERE status = 'active'
    AND last_activity_at < now() - interval '15 minutes';
  GET DIAGNOSTICS closed_count = ROW_COUNT;

  -- Absolute lifetime cap: 12 hours since login_at
  UPDATE public.user_sessions
  SET status = 'closed',
      logout_reason = 'absolute_timeout',
      logout_at = now(),
      duration_seconds = EXTRACT(EPOCH FROM (now() - login_at))::integer
  WHERE status = 'active'
    AND login_at < now() - interval '12 hours';
  GET DIAGNOSTICS abs_count = ROW_COUNT;

  RETURN closed_count + abs_count;
END;
$function$;