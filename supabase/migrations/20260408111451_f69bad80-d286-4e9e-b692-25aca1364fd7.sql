
ALTER TABLE public.sessions
  ADD COLUMN IF NOT EXISTS session_name text,
  ADD COLUMN IF NOT EXISTS pillar text DEFAULT 'all',
  ADD COLUMN IF NOT EXISTS therapy_given text,
  ADD COLUMN IF NOT EXISTS client_good_things jsonb DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS client_growth_json jsonb DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS major_win text,
  ADD COLUMN IF NOT EXISTS stories_used jsonb DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS pending_assignments_review text,
  ADD COLUMN IF NOT EXISTS seeker_what_learned text,
  ADD COLUMN IF NOT EXISTS seeker_where_to_apply text,
  ADD COLUMN IF NOT EXISTS seeker_how_to_apply text,
  ADD COLUMN IF NOT EXISTS seeker_accepted_at timestamptz,
  ADD COLUMN IF NOT EXISTS next_session_time text,
  ADD COLUMN IF NOT EXISTS next_week_assignments text,
  ADD COLUMN IF NOT EXISTS punishments text,
  ADD COLUMN IF NOT EXISTS rewards text,
  ADD COLUMN IF NOT EXISTS targets text;
