ALTER TABLE public.sessions
  ADD COLUMN IF NOT EXISTS recurrence_group_id uuid;

CREATE INDEX IF NOT EXISTS idx_sessions_recurrence_group
  ON public.sessions(recurrence_group_id);