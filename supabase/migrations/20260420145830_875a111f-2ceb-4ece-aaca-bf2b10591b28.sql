ALTER TABLE public.profiles ALTER COLUMN phone DROP NOT NULL;
UPDATE public.profiles SET phone = NULL WHERE phone = '';