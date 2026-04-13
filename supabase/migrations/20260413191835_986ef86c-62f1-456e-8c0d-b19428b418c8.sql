
-- 1. Remove sensitive tables from realtime publication
DO $$
BEGIN
  BEGIN ALTER PUBLICATION supabase_realtime DROP TABLE sessions; EXCEPTION WHEN OTHERS THEN NULL; END;
  BEGIN ALTER PUBLICATION supabase_realtime DROP TABLE messages; EXCEPTION WHEN OTHERS THEN NULL; END;
  BEGIN ALTER PUBLICATION supabase_realtime DROP TABLE session_comments; EXCEPTION WHEN OTHERS THEN NULL; END;
  BEGIN ALTER PUBLICATION supabase_realtime DROP TABLE user_sessions; EXCEPTION WHEN OTHERS THEN NULL; END;
  BEGIN ALTER PUBLICATION supabase_realtime DROP TABLE submissions; EXCEPTION WHEN OTHERS THEN NULL; END;
  BEGIN ALTER PUBLICATION supabase_realtime DROP TABLE follow_ups; EXCEPTION WHEN OTHERS THEN NULL; END;
END $$;

-- 2. Per-table rate limit (max 3 per table per day)
CREATE OR REPLACE FUNCTION public.check_single_assessment_rate_limit()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  daily_count integer;
BEGIN
  EXECUTE format(
    'SELECT COUNT(*) FROM %I WHERE seeker_id = $1 AND created_at::date = CURRENT_DATE',
    TG_TABLE_NAME
  ) INTO daily_count USING NEW.seeker_id;

  IF daily_count >= 3 THEN
    RAISE EXCEPTION 'You can only take this assessment 3 times per day.';
  END IF;

  RETURN NEW;
END;
$$;

CREATE TRIGGER rate_limit_lgt_assessments
  BEFORE INSERT ON lgt_assessments
  FOR EACH ROW EXECUTE FUNCTION check_single_assessment_rate_limit();

CREATE TRIGGER rate_limit_wheel_of_life_assessments
  BEFORE INSERT ON wheel_of_life_assessments
  FOR EACH ROW EXECUTE FUNCTION check_single_assessment_rate_limit();

CREATE TRIGGER rate_limit_firo_b_assessments
  BEFORE INSERT ON firo_b_assessments
  FOR EACH ROW EXECUTE FUNCTION check_single_assessment_rate_limit();

CREATE TRIGGER rate_limit_purusharthas_assessments
  BEFORE INSERT ON purusharthas_assessments
  FOR EACH ROW EXECUTE FUNCTION check_single_assessment_rate_limit();

CREATE TRIGGER rate_limit_happiness_assessments
  BEFORE INSERT ON happiness_assessments
  FOR EACH ROW EXECUTE FUNCTION check_single_assessment_rate_limit();

CREATE TRIGGER rate_limit_mooch_assessments
  BEFORE INSERT ON mooch_assessments
  FOR EACH ROW EXECUTE FUNCTION check_single_assessment_rate_limit();

-- 3. Add column length constraints on submissions table
ALTER TABLE submissions
  ADD CONSTRAINT chk_form_type_length CHECK (char_length(form_type) <= 50),
  ADD CONSTRAINT chk_full_name_length CHECK (char_length(full_name) <= 200),
  ADD CONSTRAINT chk_email_length CHECK (char_length(email) <= 320),
  ADD CONSTRAINT chk_mobile_length CHECK (char_length(mobile) <= 20),
  ADD CONSTRAINT chk_admin_notes_length CHECK (char_length(admin_notes) <= 5000);
