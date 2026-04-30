CREATE OR REPLACE FUNCTION public.validate_seeker_session_update()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Allow admins and the assigned coach to update any field
  IF NOT is_admin(auth.uid())
     AND NEW.coach_id IS DISTINCT FROM auth.uid()
     AND OLD.coach_id IS DISTINCT FROM auth.uid()
  THEN
    -- Seekers can only change a limited set of fields; revert coach-only fields
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