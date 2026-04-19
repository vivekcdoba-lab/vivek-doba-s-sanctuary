
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS admin_level text,
  ADD COLUMN IF NOT EXISTS admin_permissions jsonb NOT NULL DEFAULT '{}'::jsonb;

-- Backfill existing admins
UPDATE public.profiles
SET admin_level = 'admin'
WHERE role = 'admin' AND admin_level IS NULL;

-- Helper: is the given user a super admin?
CREATE OR REPLACE FUNCTION public.is_super_admin(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE user_id = _user_id
      AND role = 'admin'
      AND admin_level = 'super_admin'
  )
$$;

-- Trigger to guard escalation / demotion
CREATE OR REPLACE FUNCTION public.prevent_admin_level_escalation()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  caller uuid := auth.uid();
  caller_is_super boolean;
  super_count integer;
BEGIN
  -- If nothing changed in admin_level/admin_permissions, allow
  IF NEW.admin_level IS NOT DISTINCT FROM OLD.admin_level
     AND NEW.admin_permissions IS NOT DISTINCT FROM OLD.admin_permissions THEN
    RETURN NEW;
  END IF;

  -- Allow service-role / no-auth contexts (edge functions using service role)
  IF caller IS NULL THEN
    RETURN NEW;
  END IF;

  caller_is_super := public.is_super_admin(caller);

  -- Only super admins can change another admin's level/permissions
  IF OLD.user_id <> caller AND NOT caller_is_super THEN
    RAISE EXCEPTION 'Only super admins can modify another admin''s level or permissions';
  END IF;

  -- Promotion to super_admin requires caller to be super admin
  IF NEW.admin_level = 'super_admin'
     AND OLD.admin_level IS DISTINCT FROM 'super_admin'
     AND NOT caller_is_super THEN
    RAISE EXCEPTION 'Only super admins can promote to super admin';
  END IF;

  -- Block demoting the last super admin
  IF OLD.admin_level = 'super_admin' AND NEW.admin_level <> 'super_admin' THEN
    SELECT COUNT(*) INTO super_count
    FROM public.profiles
    WHERE role = 'admin' AND admin_level = 'super_admin';
    IF super_count <= 1 THEN
      RAISE EXCEPTION 'Cannot demote the last super admin';
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_prevent_admin_level_escalation ON public.profiles;
CREATE TRIGGER trg_prevent_admin_level_escalation
BEFORE UPDATE ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.prevent_admin_level_escalation();
