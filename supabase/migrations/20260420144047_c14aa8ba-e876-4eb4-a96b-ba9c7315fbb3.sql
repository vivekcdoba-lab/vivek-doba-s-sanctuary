-- Phase 1: add coach_id to sessions, notes to enrollments, is_coach helper, RLS for coaches, harden is_also_coach trigger.

-- A. sessions.coach_id
ALTER TABLE public.sessions
  ADD COLUMN IF NOT EXISTS coach_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL;
CREATE INDEX IF NOT EXISTS idx_sessions_coach_id ON public.sessions(coach_id);

-- G. enrollments.notes
ALTER TABLE public.enrollments
  ADD COLUMN IF NOT EXISTS notes text;

-- B. is_coach helper
CREATE OR REPLACE FUNCTION public.is_coach(_user_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE user_id = _user_id AND (role = 'coach' OR is_also_coach = true)
  )
$$;

-- B. RLS: coaches can read/update their assigned sessions
DROP POLICY IF EXISTS "Coaches view their sessions" ON public.sessions;
CREATE POLICY "Coaches view their sessions" ON public.sessions
  FOR SELECT TO authenticated
  USING (coach_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid()));

DROP POLICY IF EXISTS "Coaches update their sessions" ON public.sessions;
CREATE POLICY "Coaches update their sessions" ON public.sessions
  FOR UPDATE TO authenticated
  USING (coach_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid()));

-- B. RLS: coaches can read assessments of seekers they coach (via sessions.coach_id)
DO $$
DECLARE
  t text;
  tables text[] := ARRAY[
    'wheel_of_life_assessments',
    'lgt_assessments',
    'happiness_assessments',
    'firo_b_assessments',
    'mooch_assessments',
    'purusharthas_assessments',
    'swot_assessments'
  ];
BEGIN
  FOREACH t IN ARRAY tables LOOP
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name=t) THEN
      EXECUTE format('DROP POLICY IF EXISTS "Coaches view assigned seekers assessments" ON public.%I', t);
      EXECUTE format($p$
        CREATE POLICY "Coaches view assigned seekers assessments" ON public.%I
          FOR SELECT TO authenticated
          USING (
            seeker_id IN (
              SELECT DISTINCT s.seeker_id FROM public.sessions s
              WHERE s.coach_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid())
            )
          )
      $p$, t);
    END IF;
  END LOOP;
END $$;

-- F. Protect is_also_coach flag from non-super-admin escalation
CREATE OR REPLACE FUNCTION public.prevent_admin_level_escalation()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  caller uuid := auth.uid();
  caller_is_super boolean;
  super_count integer;
BEGIN
  -- Allow service-role / no-auth contexts (edge functions using service role)
  IF caller IS NULL THEN
    RETURN NEW;
  END IF;

  caller_is_super := public.is_super_admin(caller);

  -- Revert unauthorized is_also_coach changes
  IF NEW.is_also_coach IS DISTINCT FROM OLD.is_also_coach
     AND OLD.user_id <> caller
     AND NOT caller_is_super THEN
    NEW.is_also_coach := OLD.is_also_coach;
  END IF;

  -- If nothing changed in admin_level/admin_permissions, allow
  IF NEW.admin_level IS NOT DISTINCT FROM OLD.admin_level
     AND NEW.admin_permissions IS NOT DISTINCT FROM OLD.admin_permissions THEN
    RETURN NEW;
  END IF;

  -- Only super admins can change another admin's level/permissions
  IF OLD.user_id <> caller AND NOT caller_is_super THEN
    RAISE EXCEPTION 'Only super admins can modify another admin''s level or permissions';
  END IF;

  -- Promotion to super_admin requires caller to be super admin
  IF NEW.admin_level = 'super_admin'
     AND OLD.admin_level IS DISTINCT FROM 'super_admin'
     AND NOT caller_is_super THEN
    RAISE EXCEPTION 'Only super admins can promote to super admin';
  END IF;

  -- Block demoting the last super admin
  IF OLD.admin_level = 'super_admin' AND NEW.admin_level <> 'super_admin' THEN
    SELECT COUNT(*) INTO super_count
    FROM public.profiles
    WHERE role = 'admin' AND admin_level = 'super_admin';
    IF super_count <= 1 THEN
      RAISE EXCEPTION 'Cannot demote the last super admin';
    END IF;
  END IF;

  RETURN NEW;
END;
$function$;