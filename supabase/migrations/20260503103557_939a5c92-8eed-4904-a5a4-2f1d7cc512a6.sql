ALTER TABLE public.sessions
  ADD COLUMN IF NOT EXISTS couple_group_id uuid NULL,
  ADD COLUMN IF NOT EXISTS couple_role text NULL;

CREATE INDEX IF NOT EXISTS idx_sessions_couple_group_id
  ON public.sessions(couple_group_id)
  WHERE couple_group_id IS NOT NULL;