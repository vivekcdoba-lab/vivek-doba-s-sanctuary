ALTER TABLE public.lgt_applications
  ADD COLUMN IF NOT EXISTS version integer NOT NULL DEFAULT 1,
  ADD COLUMN IF NOT EXISTS last_emailed_at timestamptz;