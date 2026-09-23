ALTER TABLE public.contact_submissions ADD COLUMN IF NOT EXISTS notification_sent_at timestamptz;
GRANT INSERT ON public.contact_submissions TO anon, authenticated;
GRANT SELECT, UPDATE, DELETE ON public.contact_submissions TO authenticated;
GRANT ALL ON public.contact_submissions TO service_role;