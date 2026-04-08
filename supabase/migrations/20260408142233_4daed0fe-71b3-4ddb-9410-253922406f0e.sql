CREATE POLICY "Seekers can update own session reflections"
ON public.sessions
FOR UPDATE
TO authenticated
USING (seeker_id IN (SELECT profiles.id FROM profiles WHERE profiles.user_id = auth.uid()))
WITH CHECK (seeker_id IN (SELECT profiles.id FROM profiles WHERE profiles.user_id = auth.uid()));