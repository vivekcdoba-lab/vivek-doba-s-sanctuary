-- Move coach_private_notes from sessions into a coach/admin-only table
-- to prevent seekers from reading it via the sessions SELECT RLS policy.

CREATE TABLE IF NOT EXISTS public.session_private_notes (
  session_id uuid PRIMARY KEY REFERENCES public.sessions(id) ON DELETE CASCADE,
  notes text,
  updated_by uuid REFERENCES auth.users(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.session_private_notes ENABLE ROW LEVEL SECURITY;

-- Migrate any existing data
INSERT INTO public.session_private_notes (session_id, notes)
SELECT id, coach_private_notes
FROM public.sessions
WHERE coach_private_notes IS NOT NULL AND coach_private_notes <> ''
ON CONFLICT (session_id) DO NOTHING;

-- Drop the column from sessions so seekers can never read it
ALTER TABLE public.sessions DROP COLUMN IF EXISTS coach_private_notes;

-- Admin full access
CREATE POLICY "Admins manage session private notes"
ON public.session_private_notes
FOR ALL
TO authenticated
USING (public.is_admin(auth.uid()))
WITH CHECK (public.is_admin(auth.uid()));

-- Coaches assigned to the seeker (or the session's coach) can read/write
CREATE POLICY "Coaches read assigned session private notes"
ON public.session_private_notes
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.sessions s
    WHERE s.id = session_private_notes.session_id
      AND (
        public.is_assigned_coach(auth.uid(), s.seeker_id)
        OR s.coach_id IN (SELECT p.id FROM public.profiles p WHERE p.user_id = auth.uid())
      )
  )
);

CREATE POLICY "Coaches insert assigned session private notes"
ON public.session_private_notes
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.sessions s
    WHERE s.id = session_private_notes.session_id
      AND (
        public.is_assigned_coach(auth.uid(), s.seeker_id)
        OR s.coach_id IN (SELECT p.id FROM public.profiles p WHERE p.user_id = auth.uid())
      )
  )
);

CREATE POLICY "Coaches update assigned session private notes"
ON public.session_private_notes
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.sessions s
    WHERE s.id = session_private_notes.session_id
      AND (
        public.is_assigned_coach(auth.uid(), s.seeker_id)
        OR s.coach_id IN (SELECT p.id FROM public.profiles p WHERE p.user_id = auth.uid())
      )
  )
);

-- Auto-update updated_at
CREATE TRIGGER trg_session_private_notes_updated_at
BEFORE UPDATE ON public.session_private_notes
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();