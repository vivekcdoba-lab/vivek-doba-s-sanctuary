
-- 1. handle_new_user → use NULLIF so missing optional fields become NULL, not ''
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  INSERT INTO public.profiles (user_id, email, full_name, role, phone, city, state, company, occupation)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    COALESCE(NEW.raw_user_meta_data->>'role', 'seeker'),
    NULLIF(NEW.raw_user_meta_data->>'phone', ''),
    NULLIF(NEW.raw_user_meta_data->>'city', ''),
    NULLIF(NEW.raw_user_meta_data->>'state', ''),
    NULLIF(NEW.raw_user_meta_data->>'company', ''),
    NULLIF(NEW.raw_user_meta_data->>'occupation', '')
  );
  RETURN NEW;
END;
$function$;

-- 2. check_profile_duplicate → treat NULL/'' phone as no-phone
CREATE OR REPLACE FUNCTION public.check_profile_duplicate(_email text, _phone text)
RETURNS text
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  IF _email IS NOT NULL AND _email <> '' AND EXISTS (SELECT 1 FROM public.profiles WHERE email = _email) THEN
    RETURN 'email';
  END IF;
  IF _phone IS NOT NULL AND _phone <> '' AND EXISTS (SELECT 1 FROM public.profiles WHERE phone = _phone) THEN
    RETURN 'phone';
  END IF;
  RETURN 'none';
END;
$function$;

-- 3. Attach handle_new_user to auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 4. Escalation guards on profiles
DROP TRIGGER IF EXISTS profiles_prevent_role_escalation ON public.profiles;
CREATE TRIGGER profiles_prevent_role_escalation
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.prevent_role_escalation();

DROP TRIGGER IF EXISTS profiles_prevent_admin_escalation ON public.profiles;
CREATE TRIGGER profiles_prevent_admin_escalation
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.prevent_admin_level_escalation();

-- 5. updated_at triggers on key tables
DROP TRIGGER IF EXISTS profiles_set_updated_at ON public.profiles;
CREATE TRIGGER profiles_set_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS sessions_set_updated_at ON public.sessions;
CREATE TRIGGER sessions_set_updated_at
  BEFORE UPDATE ON public.sessions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS enrollments_set_updated_at ON public.enrollments;
CREATE TRIGGER enrollments_set_updated_at
  BEFORE UPDATE ON public.enrollments
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 6. Score validators on assessment tables
DROP TRIGGER IF EXISTS validate_wol_scores_trigger ON public.wheel_of_life_assessments;
CREATE TRIGGER validate_wol_scores_trigger
  BEFORE INSERT OR UPDATE ON public.wheel_of_life_assessments
  FOR EACH ROW EXECUTE FUNCTION public.validate_wol_scores();

DROP TRIGGER IF EXISTS validate_lgt_scores_trigger ON public.lgt_assessments;
CREATE TRIGGER validate_lgt_scores_trigger
  BEFORE INSERT OR UPDATE ON public.lgt_assessments
  FOR EACH ROW EXECUTE FUNCTION public.validate_lgt_scores();

DROP TRIGGER IF EXISTS validate_happiness_scores_trigger ON public.happiness_assessments;
CREATE TRIGGER validate_happiness_scores_trigger
  BEFORE INSERT OR UPDATE ON public.happiness_assessments
  FOR EACH ROW EXECUTE FUNCTION public.validate_happiness_scores();

DROP TRIGGER IF EXISTS validate_firo_b_scores_trigger ON public.firo_b_assessments;
CREATE TRIGGER validate_firo_b_scores_trigger
  BEFORE INSERT OR UPDATE ON public.firo_b_assessments
  FOR EACH ROW EXECUTE FUNCTION public.validate_firo_b_scores();

DROP TRIGGER IF EXISTS validate_mooch_scores_trigger ON public.mooch_assessments;
CREATE TRIGGER validate_mooch_scores_trigger
  BEFORE INSERT OR UPDATE ON public.mooch_assessments
  FOR EACH ROW EXECUTE FUNCTION public.validate_mooch_scores();

DROP TRIGGER IF EXISTS validate_purusharthas_scores_trigger ON public.purusharthas_assessments;
CREATE TRIGGER validate_purusharthas_scores_trigger
  BEFORE INSERT OR UPDATE ON public.purusharthas_assessments
  FOR EACH ROW EXECUTE FUNCTION public.validate_purusharthas_scores();

-- 7. Session field guard for seekers
DROP TRIGGER IF EXISTS sessions_validate_seeker_update ON public.sessions;
CREATE TRIGGER sessions_validate_seeker_update
  BEFORE UPDATE ON public.sessions
  FOR EACH ROW EXECUTE FUNCTION public.validate_seeker_session_update();
