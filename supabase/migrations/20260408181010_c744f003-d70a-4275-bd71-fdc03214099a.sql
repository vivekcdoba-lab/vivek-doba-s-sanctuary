
-- Delete mock payment records with non-uuid seeker_ids
DELETE FROM public.payments WHERE seeker_id !~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$';

-- Fix payments.seeker_id from text to uuid
ALTER TABLE public.payments ALTER COLUMN seeker_id TYPE uuid USING seeker_id::uuid;

-- Add seeker SELECT policy for payments
CREATE POLICY "Seekers can view own payments"
ON public.payments
FOR SELECT
TO authenticated
USING (
  seeker_id IN (
    SELECT id FROM public.profiles WHERE user_id = auth.uid()
  )
);

-- Make profiles.user_id NOT NULL
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.profiles WHERE user_id IS NULL) THEN
    ALTER TABLE public.profiles ALTER COLUMN user_id SET NOT NULL;
  END IF;
END $$;
