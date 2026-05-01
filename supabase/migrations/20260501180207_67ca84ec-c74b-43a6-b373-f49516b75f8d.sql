-- Auto-set attendance based on session status so total session count auto-decrements
CREATE OR REPLACE FUNCTION public.auto_set_attendance_on_status()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF NEW.status IN ('in_progress','submitted','reviewing','approved','completed','signed_off')
     AND (NEW.attendance IS NULL OR NEW.attendance = '')
  THEN
    NEW.attendance := 'present';
  END IF;

  IF NEW.status IN ('missed','no_show')
     AND (NEW.attendance IS NULL OR NEW.attendance = '')
  THEN
    NEW.attendance := 'no_show';
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_auto_attendance ON public.sessions;
CREATE TRIGGER trg_auto_attendance
BEFORE INSERT OR UPDATE OF status ON public.sessions
FOR EACH ROW
EXECUTE FUNCTION public.auto_set_attendance_on_status();

-- Backfill: any past session with a "happened" status but null attendance becomes present
UPDATE public.sessions
SET attendance = 'present'
WHERE attendance IS NULL
  AND status IN ('in_progress','submitted','reviewing','approved','completed','signed_off');

UPDATE public.sessions
SET attendance = 'no_show'
WHERE attendance IS NULL
  AND status IN ('missed','no_show');