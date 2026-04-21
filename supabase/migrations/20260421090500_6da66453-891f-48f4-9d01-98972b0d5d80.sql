-- Phase-6 one-time backfill: encrypt existing plaintext into *_enc columns.
-- Idempotent: only touches rows where *_enc IS NULL and source IS NOT NULL.
-- Each table wrapped in its own DO block so one failure doesn't abort the rest.

-- profiles
DO $$
DECLARE n int;
BEGIN
  UPDATE public.profiles SET dob_enc = public.encrypt_field(dob) WHERE dob_enc IS NULL AND dob IS NOT NULL;
  GET DIAGNOSTICS n = ROW_COUNT; RAISE NOTICE 'profiles.dob_enc: % rows', n;
  UPDATE public.profiles SET gender_enc = public.encrypt_field(gender) WHERE gender_enc IS NULL AND gender IS NOT NULL AND gender <> '';
  GET DIAGNOSTICS n = ROW_COUNT; RAISE NOTICE 'profiles.gender_enc: % rows', n;
  UPDATE public.profiles SET pincode_enc = public.encrypt_field(pincode) WHERE pincode_enc IS NULL AND pincode IS NOT NULL AND pincode <> '';
  GET DIAGNOSTICS n = ROW_COUNT; RAISE NOTICE 'profiles.pincode_enc: % rows', n;
  UPDATE public.profiles SET whatsapp_enc = public.encrypt_field(whatsapp) WHERE whatsapp_enc IS NULL AND whatsapp IS NOT NULL AND whatsapp <> '';
  GET DIAGNOSTICS n = ROW_COUNT; RAISE NOTICE 'profiles.whatsapp_enc: % rows', n;
  UPDATE public.profiles SET hometown_enc = public.encrypt_field(hometown) WHERE hometown_enc IS NULL AND hometown IS NOT NULL AND hometown <> '';
  GET DIAGNOSTICS n = ROW_COUNT; RAISE NOTICE 'profiles.hometown_enc: % rows', n;
  UPDATE public.profiles SET linkedin_url_enc = public.encrypt_field(linkedin_url) WHERE linkedin_url_enc IS NULL AND linkedin_url IS NOT NULL AND linkedin_url <> '';
  GET DIAGNOSTICS n = ROW_COUNT; RAISE NOTICE 'profiles.linkedin_url_enc: % rows', n;
  UPDATE public.profiles SET blood_group_enc = public.encrypt_field(blood_group) WHERE blood_group_enc IS NULL AND blood_group IS NOT NULL AND blood_group <> '';
  GET DIAGNOSTICS n = ROW_COUNT; RAISE NOTICE 'profiles.blood_group_enc: % rows', n;
EXCEPTION WHEN OTHERS THEN RAISE WARNING 'profiles backfill failed: %', SQLERRM;
END $$;

-- clients (intake)
DO $$
DECLARE n int;
BEGIN
  UPDATE public.clients SET personal_history_enc = public.encrypt_field(personal_history_json::text)
    WHERE personal_history_enc IS NULL AND personal_history_json IS NOT NULL;
  GET DIAGNOSTICS n = ROW_COUNT; RAISE NOTICE 'clients.personal_history_enc: % rows', n;
EXCEPTION WHEN OTHERS THEN RAISE WARNING 'clients backfill failed: %', SQLERRM;
END $$;

-- business_profiles (financial PII + lookup hashes)
DO $$
DECLARE n int;
BEGIN
  UPDATE public.business_profiles SET revenue_enc = public.encrypt_field(revenue_range)
    WHERE revenue_enc IS NULL AND revenue_range IS NOT NULL AND revenue_range <> '';
  GET DIAGNOSTICS n = ROW_COUNT; RAISE NOTICE 'business_profiles.revenue_enc: % rows', n;
EXCEPTION WHEN OTHERS THEN RAISE WARNING 'business_profiles backfill failed: %', SQLERRM;
END $$;

-- payments
DO $$
DECLARE n int;
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='payments' AND column_name='transaction_id_enc') THEN
    UPDATE public.payments SET transaction_id_enc = public.encrypt_field(transaction_id)
      WHERE transaction_id_enc IS NULL AND transaction_id IS NOT NULL AND transaction_id <> '';
    GET DIAGNOSTICS n = ROW_COUNT; RAISE NOTICE 'payments.transaction_id_enc: % rows', n;
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='payments' AND column_name='notes_enc') THEN
    UPDATE public.payments SET notes_enc = public.encrypt_field(notes)
      WHERE notes_enc IS NULL AND notes IS NOT NULL AND notes <> '';
    GET DIAGNOSTICS n = ROW_COUNT; RAISE NOTICE 'payments.notes_enc: % rows', n;
  END IF;
EXCEPTION WHEN OTHERS THEN RAISE WARNING 'payments backfill failed: %', SQLERRM;
END $$;

-- accounting_records
DO $$
DECLARE n int;
BEGIN
  UPDATE public.accounting_records SET revenue_enc = public.encrypt_field(revenue::text)
    WHERE revenue_enc IS NULL AND revenue IS NOT NULL;
  GET DIAGNOSTICS n = ROW_COUNT; RAISE NOTICE 'accounting_records.revenue_enc: % rows', n;
  UPDATE public.accounting_records SET expenses_enc = public.encrypt_field(expenses::text)
    WHERE expenses_enc IS NULL AND expenses IS NOT NULL;
  GET DIAGNOSTICS n = ROW_COUNT; RAISE NOTICE 'accounting_records.expenses_enc: % rows', n;
  UPDATE public.accounting_records SET taxes_enc = public.encrypt_field(taxes::text)
    WHERE taxes_enc IS NULL AND taxes IS NOT NULL;
  GET DIAGNOSTICS n = ROW_COUNT; RAISE NOTICE 'accounting_records.taxes_enc: % rows', n;
  UPDATE public.accounting_records SET notes_enc = public.encrypt_field(notes)
    WHERE notes_enc IS NULL AND notes IS NOT NULL AND notes <> '';
  GET DIAGNOSTICS n = ROW_COUNT; RAISE NOTICE 'accounting_records.notes_enc: % rows', n;
EXCEPTION WHEN OTHERS THEN RAISE WARNING 'accounting_records backfill failed: %', SQLERRM;
END $$;

-- cashflow_records
DO $$
DECLARE n int;
BEGIN
  UPDATE public.cashflow_records SET amount_enc = public.encrypt_field(amount::text)
    WHERE amount_enc IS NULL AND amount IS NOT NULL;
  GET DIAGNOSTICS n = ROW_COUNT; RAISE NOTICE 'cashflow_records.amount_enc: % rows', n;
  UPDATE public.cashflow_records SET description_enc = public.encrypt_field(description)
    WHERE description_enc IS NULL AND description IS NOT NULL AND description <> '';
  GET DIAGNOSTICS n = ROW_COUNT; RAISE NOTICE 'cashflow_records.description_enc: % rows', n;
EXCEPTION WHEN OTHERS THEN RAISE WARNING 'cashflow_records backfill failed: %', SQLERRM;
END $$;

-- messages
DO $$
DECLARE n int;
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='messages' AND column_name='body_enc')
     AND EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='messages' AND column_name='body') THEN
    UPDATE public.messages SET body_enc = public.encrypt_field(body)
      WHERE body_enc IS NULL AND body IS NOT NULL AND body <> '';
    GET DIAGNOSTICS n = ROW_COUNT; RAISE NOTICE 'messages.body_enc: % rows', n;
  END IF;
EXCEPTION WHEN OTHERS THEN RAISE WARNING 'messages backfill failed: %', SQLERRM;
END $$;

-- Final verification report
DO $$
DECLARE
  v_profiles int; v_clients int; v_biz int; v_pay int; v_acct int; v_cash int; v_msg int;
BEGIN
  SELECT count(*) INTO v_profiles FROM public.profiles WHERE dob_enc IS NOT NULL OR whatsapp_enc IS NOT NULL OR linkedin_url_enc IS NOT NULL;
  SELECT count(*) INTO v_clients FROM public.clients WHERE personal_history_enc IS NOT NULL;
  SELECT count(*) INTO v_biz FROM public.business_profiles WHERE revenue_enc IS NOT NULL;
  SELECT count(*) INTO v_acct FROM public.accounting_records WHERE revenue_enc IS NOT NULL OR expenses_enc IS NOT NULL;
  SELECT count(*) INTO v_cash FROM public.cashflow_records WHERE amount_enc IS NOT NULL OR description_enc IS NOT NULL;
  RAISE NOTICE '=== Backfill summary ===';
  RAISE NOTICE 'profiles encrypted rows: %', v_profiles;
  RAISE NOTICE 'clients encrypted rows: %', v_clients;
  RAISE NOTICE 'business_profiles encrypted rows: %', v_biz;
  RAISE NOTICE 'accounting_records encrypted rows: %', v_acct;
  RAISE NOTICE 'cashflow_records encrypted rows: %', v_cash;
END $$;