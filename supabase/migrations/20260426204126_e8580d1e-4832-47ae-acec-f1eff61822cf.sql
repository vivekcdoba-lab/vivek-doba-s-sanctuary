
-- FIX 7: prevent duplicate invoice numbers
CREATE UNIQUE INDEX IF NOT EXISTS payments_invoice_number_unique
  ON public.payments(invoice_number)
  WHERE invoice_number IS NOT NULL;

-- FIX 6 (a): email log for the seed function
CREATE TABLE IF NOT EXISTS public.email_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  seed_run_id text,
  recipients text[] NOT NULL,
  subject text NOT NULL,
  status text NOT NULL,
  resend_message_id text,
  error_message text,
  sent_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS email_log_seed_run_id_idx ON public.email_log(seed_run_id);
CREATE UNIQUE INDEX IF NOT EXISTS email_log_run_subject_unique
  ON public.email_log(seed_run_id, subject)
  WHERE seed_run_id IS NOT NULL;

ALTER TABLE public.email_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins read email log"
  ON public.email_log FOR SELECT
  USING (public.is_admin(auth.uid()));
