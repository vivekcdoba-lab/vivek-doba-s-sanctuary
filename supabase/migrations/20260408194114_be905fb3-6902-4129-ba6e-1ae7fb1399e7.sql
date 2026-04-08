
-- =============================================
-- FIX 1: Prevent role escalation on profiles
-- =============================================

-- Drop the existing permissive UPDATE policy
DROP POLICY IF EXISTS "Users can update own profile, admins all" ON public.profiles;

-- Create a restricted UPDATE policy that prevents role changes by non-admins
CREATE POLICY "Users can update own profile, admins all"
ON public.profiles
FOR UPDATE
TO authenticated
USING (
  (user_id = auth.uid()) OR is_admin(auth.uid())
)
WITH CHECK (
  -- Admins can change anything
  is_admin(auth.uid())
  OR
  -- Non-admins can only update if role stays the same (role column unchanged)
  (user_id = auth.uid() AND role = (SELECT p.role FROM public.profiles p WHERE p.user_id = auth.uid()))
);

-- =============================================
-- FIX 2: Restrict submissions SELECT to admins
-- =============================================

DROP POLICY IF EXISTS "Authenticated users can view submissions" ON public.submissions;

CREATE POLICY "Admins can view submissions"
ON public.submissions
FOR SELECT
TO authenticated
USING (is_admin(auth.uid()));

-- =============================================
-- FIX 3: Fix signatures storage bucket policies
-- =============================================

DROP POLICY IF EXISTS "Authenticated users can view signatures" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload signatures" ON storage.objects;

-- Only session participants and admins can view signatures
CREATE POLICY "Session participants can view signatures"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'signatures'
  AND (
    is_admin(auth.uid())
    OR
    name IN (
      SELECT ss.storage_path FROM public.session_signatures ss
      JOIN public.sessions s ON s.id = ss.session_id
      WHERE s.seeker_id IN (SELECT p.id FROM public.profiles p WHERE p.user_id = auth.uid())
    )
  )
);

-- Only signers can upload their own signatures
CREATE POLICY "Signers can upload own signatures"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'signatures'
  AND (
    is_admin(auth.uid())
    OR
    auth.uid()::text = (storage.foldername(name))[1]
  )
);

-- =============================================
-- FIX 4: Restrict session UPDATE for seekers
-- =============================================

DROP POLICY IF EXISTS "Seekers can update own session reflections" ON public.sessions;

-- Seekers can only update specific reflection columns via a trigger-based approach
-- Using a function to validate which columns seekers can change
CREATE OR REPLACE FUNCTION public.validate_seeker_session_update()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  is_seeker boolean;
BEGIN
  -- Check if the user is NOT an admin
  IF NOT is_admin(auth.uid()) THEN
    -- Seekers can only change these fields
    -- Revert any unauthorized field changes
    NEW.coach_private_notes := OLD.coach_private_notes;
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

CREATE TRIGGER validate_seeker_session_update_trigger
BEFORE UPDATE ON public.sessions
FOR EACH ROW
EXECUTE FUNCTION public.validate_seeker_session_update();

-- Re-create seeker update policy (limited to own sessions)
CREATE POLICY "Seekers can update own session reflections"
ON public.sessions
FOR UPDATE
TO authenticated
USING (
  seeker_id IN (SELECT p.id FROM profiles p WHERE p.user_id = auth.uid())
);
