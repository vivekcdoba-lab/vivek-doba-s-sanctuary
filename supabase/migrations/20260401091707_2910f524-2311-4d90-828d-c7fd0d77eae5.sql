
CREATE TABLE public.payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  seeker_id text NOT NULL,
  invoice_number text NOT NULL,
  amount numeric(12,2) NOT NULL,
  gst_amount numeric(12,2) NOT NULL DEFAULT 0,
  total_amount numeric(12,2) NOT NULL,
  payment_date date,
  due_date date,
  method text NOT NULL DEFAULT 'upi',
  transaction_id text,
  status text NOT NULL DEFAULT 'received',
  notes text,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view payments"
  ON public.payments FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert payments"
  ON public.payments FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update payments"
  ON public.payments FOR UPDATE
  TO authenticated
  USING (true);
