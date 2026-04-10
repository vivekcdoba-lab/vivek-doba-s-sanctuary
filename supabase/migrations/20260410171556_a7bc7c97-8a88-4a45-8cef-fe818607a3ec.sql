
-- Fill any existing NULL phones
UPDATE public.profiles SET phone = '' WHERE phone IS NULL;

-- Make phone NOT NULL with default
ALTER TABLE public.profiles ALTER COLUMN phone SET NOT NULL;
ALTER TABLE public.profiles ALTER COLUMN phone SET DEFAULT '';

-- Unique index on email
CREATE UNIQUE INDEX IF NOT EXISTS profiles_email_unique ON public.profiles (email);

-- Unique index on phone (exclude empty strings)
CREATE UNIQUE INDEX IF NOT EXISTS profiles_phone_unique ON public.profiles (phone) WHERE phone != '';

-- Update handle_new_user to include phone
CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  INSERT INTO public.profiles (user_id, email, full_name, role, phone)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    COALESCE(NEW.raw_user_meta_data->>'role', 'seeker'),
    COALESCE(NEW.raw_user_meta_data->>'phone', '')
  );
  RETURN NEW;
END;
$function$;
