-- 1. Attach existing escalation-prevention functions as triggers on profiles
DROP TRIGGER IF EXISTS trg_prevent_role_escalation ON public.profiles;
CREATE TRIGGER trg_prevent_role_escalation
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.prevent_role_escalation();

DROP TRIGGER IF EXISTS trg_prevent_admin_level_escalation ON public.profiles;
CREATE TRIGGER trg_prevent_admin_level_escalation
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.prevent_admin_level_escalation();

-- Also block any direct INSERT trying to set role='admin' (defense in depth);
-- the existing INSERT policy already enforces role='seeker', this trigger backstops it.
CREATE OR REPLACE FUNCTION public.enforce_profile_insert_safety()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Service role / no auth context: allow (used by edge functions / handle_new_user)
  IF auth.uid() IS NULL THEN
    RETURN NEW;
  END IF;
  -- Admins can insert any profile
  IF public.is_admin(auth.uid()) THEN
    RETURN NEW;
  END IF;
  -- Self-insert must be a seeker with no elevated fields
  IF NEW.user_id = auth.uid() THEN
    NEW.role := 'seeker';
    NEW.admin_level := NULL;
    NEW.admin_permissions := NULL;
    NEW.is_also_coach := false;
    RETURN NEW;
  END IF;
  RAISE EXCEPTION 'Not allowed to insert profile for another user';
END;
$$;

DROP TRIGGER IF EXISTS trg_enforce_profile_insert_safety ON public.profiles;
CREATE TRIGGER trg_enforce_profile_insert_safety
  BEFORE INSERT ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.enforce_profile_insert_safety();

-- 2. Submissions PII retention: purge approved/rejected submissions older than 180 days,
--    and pending submissions older than 1 year.
CREATE OR REPLACE FUNCTION public.purge_old_submissions()
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  deleted_count integer;
BEGIN
  DELETE FROM public.submissions
  WHERE (status IN ('approved','rejected') AND created_at < now() - interval '180 days')
     OR (status = 'pending' AND created_at < now() - interval '365 days');
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$;

-- Schedule daily purge via pg_cron if available
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'pg_cron') THEN
    PERFORM cron.unschedule('purge-old-submissions') 
      WHERE EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'purge-old-submissions');
    PERFORM cron.schedule(
      'purge-old-submissions',
      '17 3 * * *',
      $cron$ SELECT public.purge_old_submissions(); $cron$
    );
  END IF;
EXCEPTION WHEN OTHERS THEN
  -- pg_cron not available; manual cleanup function is still callable
  NULL;
END $$;