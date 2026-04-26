-- 1) coach_seekers table
CREATE TABLE IF NOT EXISTS public.coach_seekers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  coach_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  seeker_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  assigned_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  assigned_at timestamptz NOT NULL DEFAULT now(),
  is_primary boolean NOT NULL DEFAULT true,
  CONSTRAINT coach_seekers_unique UNIQUE (coach_id, seeker_id)
);

CREATE INDEX IF NOT EXISTS idx_coach_seekers_coach ON public.coach_seekers(coach_id);
CREATE INDEX IF NOT EXISTS idx_coach_seekers_seeker ON public.coach_seekers(seeker_id);

ALTER TABLE public.coach_seekers ENABLE ROW LEVEL SECURITY;

-- 2) Helper SECURITY DEFINER function (no RLS recursion)
CREATE OR REPLACE FUNCTION public.is_assigned_coach(_user_id uuid, _seeker_profile_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.coach_seekers cs
    JOIN public.profiles cp ON cp.id = cs.coach_id
    WHERE cp.user_id = _user_id
      AND cs.seeker_id = _seeker_profile_id
  );
$$;

-- 3) RLS on coach_seekers
CREATE POLICY "Admins manage coach_seekers"
  ON public.coach_seekers FOR ALL
  USING (public.is_admin(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()));

CREATE POLICY "Coaches view own coach_seekers"
  ON public.coach_seekers FOR SELECT
  USING (
    coach_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid())
  );

-- 4) Profiles: allow coaches to view assigned seekers' profiles
CREATE POLICY "Coaches view assigned seeker profiles"
  ON public.profiles FOR SELECT
  USING (public.is_assigned_coach(auth.uid(), id));

-- 5) Sessions: coaches can view/insert/update for their assigned seekers
CREATE POLICY "Coaches view sessions of assigned seekers"
  ON public.sessions FOR SELECT
  USING (
    public.is_assigned_coach(auth.uid(), seeker_id)
    OR coach_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid())
  );

CREATE POLICY "Coaches insert sessions for assigned seekers"
  ON public.sessions FOR INSERT
  WITH CHECK (
    public.is_assigned_coach(auth.uid(), seeker_id)
    OR coach_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid())
  );

CREATE POLICY "Coaches update sessions of assigned seekers"
  ON public.sessions FOR UPDATE
  USING (
    public.is_assigned_coach(auth.uid(), seeker_id)
    OR coach_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid())
  );

-- 6) Assignments: coaches can view/insert/update for their assigned seekers
CREATE POLICY "Coaches view assignments of assigned seekers"
  ON public.assignments FOR SELECT
  USING (public.is_assigned_coach(auth.uid(), seeker_id));

CREATE POLICY "Coaches insert assignments for assigned seekers"
  ON public.assignments FOR INSERT
  WITH CHECK (public.is_assigned_coach(auth.uid(), seeker_id));

CREATE POLICY "Coaches update assignments of assigned seekers"
  ON public.assignments FOR UPDATE
  USING (public.is_assigned_coach(auth.uid(), seeker_id));
