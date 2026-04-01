
-- Create a security definer function to check admin role without RLS recursion
CREATE OR REPLACE FUNCTION public.is_admin(_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE user_id = _user_id AND role = 'admin'
  )
$$;

-- Fix payments table: restrict to admin + authenticated
DROP POLICY IF EXISTS "Anyone can insert payments" ON public.payments;
DROP POLICY IF EXISTS "Anyone can update payments" ON public.payments;
DROP POLICY IF EXISTS "Anyone can view payments" ON public.payments;

CREATE POLICY "Admin can view payments" ON public.payments
  FOR SELECT TO authenticated
  USING (public.is_admin(auth.uid()));

CREATE POLICY "Admin can insert payments" ON public.payments
  FOR INSERT TO authenticated
  WITH CHECK (public.is_admin(auth.uid()));

CREATE POLICY "Admin can update payments" ON public.payments
  FOR UPDATE TO authenticated
  USING (public.is_admin(auth.uid()));

-- Fix submissions table: keep public insert, restrict update to admin
DROP POLICY IF EXISTS "Authenticated users can update submissions" ON public.submissions;

CREATE POLICY "Admin can update submissions" ON public.submissions
  FOR UPDATE TO authenticated
  USING (public.is_admin(auth.uid()));
