-- Part 2.1: Couple/Group sessions support
ALTER TABLE public.sessions
  ADD COLUMN IF NOT EXISTS session_type text
  CHECK (session_type IN ('individual','couple','group')) DEFAULT 'individual';

UPDATE public.sessions SET session_type = 'individual' WHERE session_type IS NULL;

CREATE TABLE IF NOT EXISTS public.session_participants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid NOT NULL REFERENCES public.sessions(id) ON DELETE CASCADE,
  seeker_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  role text NOT NULL DEFAULT 'participant' CHECK (role IN ('primary','partner','participant')),
  attendance text,
  added_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (session_id, seeker_id)
);

CREATE INDEX IF NOT EXISTS idx_session_participants_session ON public.session_participants(session_id);
CREATE INDEX IF NOT EXISTS idx_session_participants_seeker ON public.session_participants(seeker_id);

ALTER TABLE public.session_participants ENABLE ROW LEVEL SECURITY;

-- Admins: full access
CREATE POLICY "Admins manage session participants"
  ON public.session_participants FOR ALL
  USING (public.is_admin(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()));

-- Coaches: full access
CREATE POLICY "Coaches manage session participants"
  ON public.session_participants FOR ALL
  USING (public.is_coach(auth.uid()))
  WITH CHECK (public.is_coach(auth.uid()));

-- Seekers: can only see their own participation row
CREATE POLICY "Seekers view own participation"
  ON public.session_participants FOR SELECT
  USING (
    seeker_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid())
  );

-- Backfill: insert primary participant rows for all existing sessions
INSERT INTO public.session_participants (session_id, seeker_id, role)
SELECT s.id, s.seeker_id, 'primary'
FROM public.sessions s
WHERE s.seeker_id IS NOT NULL
ON CONFLICT (session_id, seeker_id) DO NOTHING;

-- Part 1.4 prep: add session_invite as accepted notification type (no schema change needed - 'notifications' table accepts free-form type)
-- (No-op placeholder)
