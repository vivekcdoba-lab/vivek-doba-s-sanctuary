## Problem

Coaches cannot reschedule a session. The toast `record "new" has no field "coach_private_notes"` comes from the Postgres trigger function `public.validate_seeker_session_update`, which runs on every `UPDATE` on `public.sessions`. It tries to do `NEW.coach_private_notes := OLD.coach_private_notes;`, but the `sessions` table has no such column, so the trigger aborts the update.

This blocks both the new "Reschedule & Notify" flow and the "Delete" flow on `/coaching/schedule`.

## Fix

Patch the trigger function to remove the reference to the non-existent `coach_private_notes` column. Keep all other guard logic intact (seekers still cannot edit coach-only fields).

### Migration

```sql
CREATE OR REPLACE FUNCTION public.validate_seeker_session_update()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT is_admin(auth.uid()) THEN
    -- Revert any unauthorized field changes by seekers
    NEW.engagement_score := OLD.engagement_score;
    NEW.punishments := OLD.punishments;
    NEW.rewards := OLD.rewards;
    NEW.key_insights := OLD.key_insights;
    NEW.breakthroughs := OLD.breakthroughs;
    NEW.session_notes := OLD.session_notes;
    NEW.therapy_given := OLD.therapy_given;
    NEW.targets := OLD.targets;
    NEW.next_week_assignments := OLD.next_week_assignments;
    NEW.pending_assignments_review := OLD.pending_assignments_review;
    NEW.stories_used := OLD.stories_used;
    NEW.client_good_things := OLD.client_good_things;
    NEW.client_growth_json := OLD.client_growth_json;
    NEW.attendance := OLD.attendance;
    NEW.pillar := OLD.pillar;
    NEW.session_name := OLD.session_name;
    NEW.duration_minutes := OLD.duration_minutes;
    NEW.location_type := OLD.location_type;
    NEW.meeting_link := OLD.meeting_link;
    NEW.missed_reason := OLD.missed_reason;
    NEW.reschedule_reason := OLD.reschedule_reason;
    NEW.revision_note := OLD.revision_note;
    NEW.next_session_time := OLD.next_session_time;
    NEW.major_win := OLD.major_win;
    NEW.topics_covered := OLD.topics_covered;
    NEW.course_id := OLD.course_id;
    NEW.session_number := OLD.session_number;
    NEW.date := OLD.date;
    NEW.start_time := OLD.start_time;
    NEW.end_time := OLD.end_time;
    NEW.seeker_id := OLD.seeker_id;
  END IF;
  RETURN NEW;
END;
$$;
```

### Note

The trigger gates seekers, but coaches/admins doing the reschedule are also subject to it (the admin bypass uses `is_admin`). The function uses `is_admin`, so coach-initiated updates currently take the seeker branch. That branch still reverts critical fields like `date`, `start_time`, `end_time` for non-admins — which would silently undo a coach reschedule.

I'll also extend the bypass so coaches assigned to the session can update scheduling/notes fields. Concretely, replace the guard with:

```sql
IF NOT is_admin(auth.uid())
   AND NOT EXISTS (
     SELECT 1 FROM public.sessions s
     WHERE s.id = NEW.id AND s.coach_id = auth.uid()
   )
THEN
  -- existing seeker-revert block (without coach_private_notes)
END IF;
```

This keeps seekers locked down while letting the assigned coach reschedule, edit notes, and update meeting details. Admins continue to have full access.

## Files

- New migration adjusting `public.validate_seeker_session_update` (the trigger itself stays bound to `sessions`).
- No frontend changes required; `CoachSchedule.tsx` reschedule/delete flows will start working once the trigger is fixed.
