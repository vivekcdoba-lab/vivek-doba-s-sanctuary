ALTER TABLE public.agreements DROP CONSTRAINT IF EXISTS agreements_type_check;
ALTER TABLE public.agreements ADD CONSTRAINT agreements_type_check
  CHECK (type IN ('coaching', 'goal', 'fee_structure', 'premium_agreement'));