
DROP POLICY "Authenticated users can view payments" ON public.payments;
DROP POLICY "Authenticated users can insert payments" ON public.payments;
DROP POLICY "Authenticated users can update payments" ON public.payments;

CREATE POLICY "Anyone can view payments" ON public.payments FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Anyone can insert payments" ON public.payments FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Anyone can update payments" ON public.payments FOR UPDATE TO anon, authenticated USING (true);
