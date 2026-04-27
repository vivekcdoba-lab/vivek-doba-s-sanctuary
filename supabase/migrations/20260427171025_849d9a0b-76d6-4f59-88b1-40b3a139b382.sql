-- Fix 1: Drop plaintext OTP column (encrypted code_enc remains)
ALTER TABLE public.otp_codes DROP COLUMN IF EXISTS otp_code;

-- Fix 2: Allow seekers to read their own signatures
DROP POLICY IF EXISTS "Seekers read own signatures" ON public.session_signatures;
CREATE POLICY "Seekers read own signatures"
ON public.session_signatures
FOR SELECT
TO authenticated
USING (
  signer_id IN (
    SELECT id FROM public.profiles WHERE user_id = auth.uid()
  )
);