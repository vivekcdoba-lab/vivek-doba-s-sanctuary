
-- =============================================
-- FIX: Trigger-based role escalation prevention
-- =============================================
CREATE OR REPLACE FUNCTION public.prevent_role_escalation()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- If the role is being changed and the user is not an admin, revert it
  IF NEW.role IS DISTINCT FROM OLD.role AND NOT is_admin(auth.uid()) THEN
    NEW.role := OLD.role;
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER prevent_role_escalation_trigger
BEFORE UPDATE ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.prevent_role_escalation();

-- =============================================
-- FIX: Assessments - change from public to authenticated
-- =============================================
DROP POLICY IF EXISTS "Coaches can delete their own assessments" ON public.assessments;
DROP POLICY IF EXISTS "Coaches can insert their own assessments" ON public.assessments;
DROP POLICY IF EXISTS "Coaches can update their own assessments" ON public.assessments;
DROP POLICY IF EXISTS "Coaches can view their own assessments" ON public.assessments;

CREATE POLICY "Coaches can view their own assessments" ON public.assessments FOR SELECT TO authenticated USING (auth.uid() = coach_id);
CREATE POLICY "Coaches can insert their own assessments" ON public.assessments FOR INSERT TO authenticated WITH CHECK (auth.uid() = coach_id);
CREATE POLICY "Coaches can update their own assessments" ON public.assessments FOR UPDATE TO authenticated USING (auth.uid() = coach_id);
CREATE POLICY "Coaches can delete their own assessments" ON public.assessments FOR DELETE TO authenticated USING (auth.uid() = coach_id);

-- =============================================
-- FIX: Clients - change from public to authenticated
-- =============================================
DROP POLICY IF EXISTS "Coaches can delete their own clients" ON public.clients;
DROP POLICY IF EXISTS "Coaches can insert their own clients" ON public.clients;
DROP POLICY IF EXISTS "Coaches can update their own clients" ON public.clients;
DROP POLICY IF EXISTS "Coaches can view their own clients" ON public.clients;

CREATE POLICY "Coaches can view their own clients" ON public.clients FOR SELECT TO authenticated USING (auth.uid() = coach_id);
CREATE POLICY "Coaches can insert their own clients" ON public.clients FOR INSERT TO authenticated WITH CHECK (auth.uid() = coach_id);
CREATE POLICY "Coaches can update their own clients" ON public.clients FOR UPDATE TO authenticated USING (auth.uid() = coach_id);
CREATE POLICY "Coaches can delete their own clients" ON public.clients FOR DELETE TO authenticated USING (auth.uid() = coach_id);

-- =============================================
-- FIX: Agreements - change from public to authenticated
-- =============================================
DROP POLICY IF EXISTS "Coaches can delete their own agreements" ON public.agreements;
DROP POLICY IF EXISTS "Coaches can insert their own agreements" ON public.agreements;
DROP POLICY IF EXISTS "Coaches can update their own agreements" ON public.agreements;
DROP POLICY IF EXISTS "Coaches can view their own agreements" ON public.agreements;

CREATE POLICY "Coaches can view their own agreements" ON public.agreements FOR SELECT TO authenticated USING (auth.uid() = coach_id);
CREATE POLICY "Coaches can insert their own agreements" ON public.agreements FOR INSERT TO authenticated WITH CHECK (auth.uid() = coach_id);
CREATE POLICY "Coaches can update their own agreements" ON public.agreements FOR UPDATE TO authenticated USING (auth.uid() = coach_id);
CREATE POLICY "Coaches can delete their own agreements" ON public.agreements FOR DELETE TO authenticated USING (auth.uid() = coach_id);
