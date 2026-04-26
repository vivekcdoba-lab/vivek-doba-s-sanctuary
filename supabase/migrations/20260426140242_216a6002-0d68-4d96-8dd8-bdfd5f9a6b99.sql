
-- 1. Constrain role + uniqueness on program_trainers
ALTER TABLE public.program_trainers
  ALTER COLUMN role SET DEFAULT 'co_coach';

UPDATE public.program_trainers SET role = 'co_coach' WHERE role IS NULL OR role NOT IN ('lead','co_coach','assistant');

ALTER TABLE public.program_trainers
  ADD CONSTRAINT program_trainers_role_check CHECK (role IN ('lead','co_coach','assistant'));

ALTER TABLE public.program_trainers
  ADD CONSTRAINT program_trainers_program_trainer_unique UNIQUE (program_id, trainer_id);

-- 2. Enable RLS
ALTER TABLE public.program_trainers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins manage program_trainers"
  ON public.program_trainers
  FOR ALL
  TO authenticated
  USING (public.is_admin(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()));

CREATE POLICY "Coaches view their own program assignments"
  ON public.program_trainers
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = program_trainers.trainer_id
        AND p.user_id = auth.uid()
    )
  );

CREATE POLICY "Anyone can view program trainers"
  ON public.program_trainers
  FOR SELECT
  TO anon, authenticated
  USING (true);

-- 3. Auto-link trigger: enrollment INSERT -> coach_seekers
CREATE OR REPLACE FUNCTION public.auto_link_coaches_on_enrollment()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.coach_seekers (coach_id, seeker_id, assigned_by, is_primary)
  SELECT pt.trainer_id, NEW.seeker_id, NULL, (pt.role = 'lead')
  FROM public.program_trainers pt
  WHERE pt.program_id = NEW.course_id
  ON CONFLICT (coach_id, seeker_id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_auto_link_coaches_on_enrollment ON public.enrollments;
CREATE TRIGGER trg_auto_link_coaches_on_enrollment
AFTER INSERT ON public.enrollments
FOR EACH ROW
EXECUTE FUNCTION public.auto_link_coaches_on_enrollment();

-- 4. Auto-link trigger: program_trainers INSERT -> back-fill coach_seekers
CREATE OR REPLACE FUNCTION public.auto_link_seekers_on_program_trainer_insert()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.coach_seekers (coach_id, seeker_id, assigned_by, is_primary)
  SELECT NEW.trainer_id, e.seeker_id, NULL, (NEW.role = 'lead')
  FROM public.enrollments e
  WHERE e.course_id = NEW.program_id
  ON CONFLICT (coach_id, seeker_id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_auto_link_seekers_on_program_trainer_insert ON public.program_trainers;
CREATE TRIGGER trg_auto_link_seekers_on_program_trainer_insert
AFTER INSERT ON public.program_trainers
FOR EACH ROW
EXECUTE FUNCTION public.auto_link_seekers_on_program_trainer_insert();

-- 5. One-time backfill of existing data
INSERT INTO public.coach_seekers (coach_id, seeker_id, assigned_by, is_primary)
SELECT pt.trainer_id, e.seeker_id, NULL, (pt.role = 'lead')
FROM public.program_trainers pt
JOIN public.enrollments e ON e.course_id = pt.program_id
ON CONFLICT (coach_id, seeker_id) DO NOTHING;
