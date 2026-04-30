-- Timezone-aware scheduling: additive columns + backfill + sync trigger.
-- Preservation Policy: legacy date/start_time/end_time stay in place and remain coherent.

-- 1. Sessions ----------------------------------------------------------------
ALTER TABLE public.sessions
  ADD COLUMN IF NOT EXISTS start_at  timestamptz,
  ADD COLUMN IF NOT EXISTS end_at    timestamptz,
  ADD COLUMN IF NOT EXISTS timezone  text;

UPDATE public.sessions
SET start_at = (date::text || ' ' || COALESCE(start_time::text, '00:00:00'))::timestamp AT TIME ZONE 'Asia/Kolkata',
    end_at   = (date::text || ' ' || COALESCE(end_time::text, '00:00:00'))::timestamp AT TIME ZONE 'Asia/Kolkata',
    timezone = COALESCE(timezone, 'Asia/Kolkata')
WHERE start_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_sessions_start_at ON public.sessions(start_at);

-- 2. Calendar events ---------------------------------------------------------
ALTER TABLE public.calendar_events
  ADD COLUMN IF NOT EXISTS start_at  timestamptz,
  ADD COLUMN IF NOT EXISTS end_at    timestamptz,
  ADD COLUMN IF NOT EXISTS timezone  text;

UPDATE public.calendar_events
SET start_at = (date::text || ' ' || COALESCE(start_time::text, '00:00:00'))::timestamp AT TIME ZONE 'Asia/Kolkata',
    end_at   = (date::text || ' ' || COALESCE(end_time::text, '00:00:00'))::timestamp AT TIME ZONE 'Asia/Kolkata',
    timezone = COALESCE(timezone, 'Asia/Kolkata')
WHERE start_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_calendar_events_start_at ON public.calendar_events(start_at);

-- 3. Sync trigger ------------------------------------------------------------
-- Keeps (date,start_time,end_time) coherent with (start_at,end_at) using the row's timezone.
-- If caller writes start_at, derive legacy fields. If caller writes legacy fields, derive start_at.
CREATE OR REPLACE FUNCTION public.sync_session_time_fields()
RETURNS trigger
LANGUAGE plpgsql
SET search_path TO 'public'
AS $$
DECLARE
  v_tz text := COALESCE(NEW.timezone, 'Asia/Kolkata');
BEGIN
  NEW.timezone := v_tz;

  IF TG_OP = 'INSERT' THEN
    IF NEW.start_at IS NOT NULL THEN
      NEW.date       := (NEW.start_at AT TIME ZONE v_tz)::date;
      NEW.start_time := (NEW.start_at AT TIME ZONE v_tz)::time;
      IF NEW.end_at IS NOT NULL THEN
        NEW.end_time := (NEW.end_at AT TIME ZONE v_tz)::time;
      END IF;
    ELSIF NEW.date IS NOT NULL AND NEW.start_time IS NOT NULL THEN
      NEW.start_at := (NEW.date::text || ' ' || NEW.start_time::text)::timestamp AT TIME ZONE v_tz;
      IF NEW.end_time IS NOT NULL THEN
        NEW.end_at := (NEW.date::text || ' ' || NEW.end_time::text)::timestamp AT TIME ZONE v_tz;
      END IF;
    END IF;
    RETURN NEW;
  END IF;

  -- UPDATE
  IF NEW.start_at IS DISTINCT FROM OLD.start_at AND NEW.start_at IS NOT NULL THEN
    NEW.date       := (NEW.start_at AT TIME ZONE v_tz)::date;
    NEW.start_time := (NEW.start_at AT TIME ZONE v_tz)::time;
  ELSIF (NEW.date IS DISTINCT FROM OLD.date OR NEW.start_time IS DISTINCT FROM OLD.start_time)
        AND NEW.date IS NOT NULL AND NEW.start_time IS NOT NULL THEN
    NEW.start_at := (NEW.date::text || ' ' || NEW.start_time::text)::timestamp AT TIME ZONE v_tz;
  END IF;

  IF NEW.end_at IS DISTINCT FROM OLD.end_at AND NEW.end_at IS NOT NULL THEN
    NEW.end_time := (NEW.end_at AT TIME ZONE v_tz)::time;
  ELSIF NEW.end_time IS DISTINCT FROM OLD.end_time
        AND NEW.date IS NOT NULL AND NEW.end_time IS NOT NULL THEN
    NEW.end_at := (NEW.date::text || ' ' || NEW.end_time::text)::timestamp AT TIME ZONE v_tz;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_sync_session_time_fields ON public.sessions;
CREATE TRIGGER trg_sync_session_time_fields
BEFORE INSERT OR UPDATE ON public.sessions
FOR EACH ROW EXECUTE FUNCTION public.sync_session_time_fields();

DROP TRIGGER IF EXISTS trg_sync_calendar_event_time_fields ON public.calendar_events;
CREATE TRIGGER trg_sync_calendar_event_time_fields
BEFORE INSERT OR UPDATE ON public.calendar_events
FOR EACH ROW EXECUTE FUNCTION public.sync_session_time_fields();

-- 4. Profile timezone preference --------------------------------------------
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS timezone text;