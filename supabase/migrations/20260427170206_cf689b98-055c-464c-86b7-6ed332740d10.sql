DROP POLICY IF EXISTS "Anyone can view program trainers" ON public.program_trainers;

CREATE POLICY "Authenticated users can view program trainers"
ON public.program_trainers
FOR SELECT
TO authenticated
USING (true);