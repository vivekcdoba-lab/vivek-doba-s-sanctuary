ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS country text DEFAULT 'IN';
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS country text DEFAULT 'IN';