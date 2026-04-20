ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS is_also_coach boolean NOT NULL DEFAULT false;

UPDATE public.profiles
SET is_also_coach = true
WHERE email IN ('dobaarchana@gmail.com','vivekcdoba@gmail.com');