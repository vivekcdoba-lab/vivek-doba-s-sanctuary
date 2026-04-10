
ALTER TABLE public.sessions ADD COLUMN IF NOT EXISTS seeker_feedback_json jsonb DEFAULT NULL;
