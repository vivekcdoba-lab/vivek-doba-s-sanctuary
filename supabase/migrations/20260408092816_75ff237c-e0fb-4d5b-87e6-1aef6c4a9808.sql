
CREATE TABLE public.otp_codes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  identifier text NOT NULL UNIQUE,
  otp_code text NOT NULL,
  expires_at timestamptz NOT NULL,
  attempts integer NOT NULL DEFAULT 0,
  is_used boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.otp_codes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role manages OTP codes"
ON public.otp_codes
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- Add date and location columns to courses
ALTER TABLE public.courses ADD COLUMN IF NOT EXISTS event_date date;
ALTER TABLE public.courses ADD COLUMN IF NOT EXISTS location text;
ALTER TABLE public.courses ADD COLUMN IF NOT EXISTS location_type text DEFAULT 'in_person';
