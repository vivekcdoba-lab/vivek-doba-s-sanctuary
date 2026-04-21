-- =====================================================
-- PHASE 3: Financial + messages encryption columns
-- =====================================================

ALTER TABLE public.business_profiles
  ADD COLUMN IF NOT EXISTS gst_number_enc bytea,
  ADD COLUMN IF NOT EXISTS pan_enc bytea,
  ADD COLUMN IF NOT EXISTS bank_account_enc bytea,
  ADD COLUMN IF NOT EXISTS ifsc_enc bytea,
  ADD COLUMN IF NOT EXISTS revenue_enc bytea,
  ADD COLUMN IF NOT EXISTS gst_hash text,
  ADD COLUMN IF NOT EXISTS pan_hash text;

CREATE INDEX IF NOT EXISTS business_profiles_gst_hash_idx ON public.business_profiles(gst_hash);
CREATE INDEX IF NOT EXISTS business_profiles_pan_hash_idx ON public.business_profiles(pan_hash);

ALTER TABLE public.payments
  ADD COLUMN IF NOT EXISTS amount_enc bytea,
  ADD COLUMN IF NOT EXISTS total_amount_enc bytea,
  ADD COLUMN IF NOT EXISTS transaction_id_enc bytea,
  ADD COLUMN IF NOT EXISTS notes_enc bytea,
  ADD COLUMN IF NOT EXISTS payer_pan_enc bytea,
  ADD COLUMN IF NOT EXISTS payer_gst_enc bytea,
  ADD COLUMN IF NOT EXISTS bank_ref_enc bytea;

ALTER TABLE public.accounting_records
  ADD COLUMN IF NOT EXISTS revenue_enc bytea,
  ADD COLUMN IF NOT EXISTS expenses_enc bytea,
  ADD COLUMN IF NOT EXISTS taxes_enc bytea,
  ADD COLUMN IF NOT EXISTS notes_enc bytea;

ALTER TABLE public.cashflow_records
  ADD COLUMN IF NOT EXISTS amount_enc bytea,
  ADD COLUMN IF NOT EXISTS description_enc bytea;

ALTER TABLE public.messages
  ADD COLUMN IF NOT EXISTS content_enc bytea;