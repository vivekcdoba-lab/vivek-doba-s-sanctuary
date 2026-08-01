-- 1. courses.sessions_included
ALTER TABLE public.courses ADD COLUMN IF NOT EXISTS sessions_included integer NOT NULL DEFAULT 0;

UPDATE public.courses SET sessions_included = 24 WHERE name ILIKE '%LGT%';
UPDATE public.courses SET sessions_included = 12 WHERE name ILIKE '%udyogtatva%';

-- 2. enrollments columns
ALTER TABLE public.enrollments
  ADD COLUMN IF NOT EXISTS sessions_committed integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS sessions_used integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS workshop_credits_total integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS workshop_credits_used integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS earned_credits integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS bonus_sessions_granted integer NOT NULL DEFAULT 0;

-- 3. copy sessions_included on insert
CREATE OR REPLACE FUNCTION public.enrollment_apply_course_defaults()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_included integer;
  v_name text;
BEGIN
  IF NEW.course_id IS NOT NULL THEN
    SELECT sessions_included, name INTO v_included, v_name
      FROM public.courses WHERE id = NEW.course_id;
    IF COALESCE(NEW.sessions_committed, 0) = 0 THEN
      NEW.sessions_committed := COALESCE(v_included, 0);
    END IF;
    IF COALESCE(NEW.workshop_credits_total, 0) = 0 AND v_name ILIKE '%LGT%' THEN
      NEW.workshop_credits_total := 6;
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_enrollment_course_defaults ON public.enrollments;
CREATE TRIGGER trg_enrollment_course_defaults
  BEFORE INSERT ON public.enrollments
  FOR EACH ROW EXECUTE FUNCTION public.enrollment_apply_course_defaults();

-- backfill existing enrollments
UPDATE public.enrollments e
SET sessions_committed = c.sessions_included,
    workshop_credits_total = CASE WHEN c.name ILIKE '%LGT%' THEN 6 ELSE e.workshop_credits_total END
FROM public.courses c
WHERE c.id = e.course_id AND e.sessions_committed = 0;

UPDATE public.enrollments e
SET sessions_used = sub.cnt
FROM (
  SELECT seeker_id, course_id, COUNT(*) AS cnt
  FROM public.sessions WHERE course_id IS NOT NULL
  GROUP BY seeker_id, course_id
) sub
WHERE sub.seeker_id = e.seeker_id AND sub.course_id = e.course_id;

-- 4. session cap
CREATE OR REPLACE FUNCTION public.enforce_session_cap()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_enr public.enrollments;
  v_allowed integer;
BEGIN
  IF NEW.course_id IS NULL OR NEW.seeker_id IS NULL THEN
    RETURN NEW;
  END IF;

  SELECT * INTO v_enr FROM public.enrollments
   WHERE seeker_id = NEW.seeker_id AND course_id = NEW.course_id
   ORDER BY created_at DESC LIMIT 1;

  IF NOT FOUND THEN
    RETURN NEW;
  END IF;

  v_allowed := COALESCE(v_enr.sessions_committed, 0) + COALESCE(v_enr.bonus_sessions_granted, 0);

  IF v_allowed <= 0 THEN
    RETURN NEW; -- workshops / programs with no session entitlement
  END IF;

  IF COALESCE(v_enr.sessions_used, 0) >= v_allowed THEN
    RAISE EXCEPTION 'Session limit reached: % of % delivered', v_enr.sessions_used, v_allowed;
  END IF;

  UPDATE public.enrollments
     SET sessions_used = COALESCE(sessions_used, 0) + 1
   WHERE id = v_enr.id;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_enforce_session_cap ON public.sessions;
CREATE TRIGGER trg_enforce_session_cap
  BEFORE INSERT ON public.sessions
  FOR EACH ROW EXECUTE FUNCTION public.enforce_session_cap();

CREATE OR REPLACE FUNCTION public.release_session_slot()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF OLD.course_id IS NOT NULL AND OLD.seeker_id IS NOT NULL THEN
    UPDATE public.enrollments
       SET sessions_used = GREATEST(COALESCE(sessions_used, 0) - 1, 0)
     WHERE seeker_id = OLD.seeker_id AND course_id = OLD.course_id;
  END IF;
  RETURN OLD;
END;
$$;

DROP TRIGGER IF EXISTS trg_release_session_slot ON public.sessions;
CREATE TRIGGER trg_release_session_slot
  AFTER DELETE ON public.sessions
  FOR EACH ROW EXECUTE FUNCTION public.release_session_slot();

-- 5. assignment reward
CREATE OR REPLACE FUNCTION public.award_assignment_credits()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_enr public.enrollments;
  v_credits integer;
  v_bonus integer;
  v_convertible integer;
BEGIN
  IF NEW.status <> 'reviewed' OR OLD.status = 'reviewed' THEN
    RETURN NEW;
  END IF;

  SELECT * INTO v_enr FROM public.enrollments
   WHERE seeker_id = NEW.seeker_id
     AND (NEW.course_id IS NULL OR course_id = NEW.course_id)
   ORDER BY created_at DESC LIMIT 1;

  IF NOT FOUND THEN
    RETURN NEW;
  END IF;

  v_credits := COALESCE(v_enr.earned_credits, 0) + 4;
  v_bonus := COALESCE(v_enr.bonus_sessions_granted, 0);

  -- every 10 credits -> 1 bonus session, cap 3, leftover carries forward
  v_convertible := LEAST(v_credits / 10, 3 - v_bonus);
  IF v_convertible > 0 THEN
    v_bonus := v_bonus + v_convertible;
    v_credits := v_credits - (v_convertible * 10);
  END IF;

  UPDATE public.enrollments
     SET earned_credits = v_credits,
         bonus_sessions_granted = v_bonus
   WHERE id = v_enr.id;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_award_assignment_credits ON public.assignments;
CREATE TRIGGER trg_award_assignment_credits
  AFTER UPDATE OF status ON public.assignments
  FOR EACH ROW EXECUTE FUNCTION public.award_assignment_credits();

-- 6. workshop credits: separate, never convert to sessions
CREATE OR REPLACE FUNCTION public.consume_workshop_credit(_enrollment_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_enr public.enrollments;
BEGIN
  SELECT * INTO v_enr FROM public.enrollments WHERE id = _enrollment_id;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Enrollment not found';
  END IF;

  IF NOT (public.is_admin(auth.uid()) OR public.is_coach(auth.uid()) OR auth.uid() IS NULL) THEN
    RAISE EXCEPTION 'Not authorized';
  END IF;

  IF COALESCE(v_enr.workshop_credits_used, 0) >= COALESCE(v_enr.workshop_credits_total, 0) THEN
    RAISE EXCEPTION 'No workshop credits remaining: % of % used',
      v_enr.workshop_credits_used, v_enr.workshop_credits_total;
  END IF;

  UPDATE public.enrollments
     SET workshop_credits_used = COALESCE(workshop_credits_used, 0) + 1
   WHERE id = _enrollment_id;

  RETURN jsonb_build_object(
    'success', true,
    'workshop_credits_used', COALESCE(v_enr.workshop_credits_used, 0) + 1,
    'workshop_credits_total', COALESCE(v_enr.workshop_credits_total, 0)
  );
END;
$$;

-- guard: workshop credits never inflate session entitlement
CREATE OR REPLACE FUNCTION public.guard_enrollment_credit_rules()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF NEW.bonus_sessions_granted > 3 THEN
    NEW.bonus_sessions_granted := 3;
  END IF;
  IF NEW.workshop_credits_used > NEW.workshop_credits_total THEN
    RAISE EXCEPTION 'Workshop credits used cannot exceed total';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_guard_enrollment_credit_rules ON public.enrollments;
CREATE TRIGGER trg_guard_enrollment_credit_rules
  BEFORE INSERT OR UPDATE ON public.enrollments
  FOR EACH ROW EXECUTE FUNCTION public.guard_enrollment_credit_rules();