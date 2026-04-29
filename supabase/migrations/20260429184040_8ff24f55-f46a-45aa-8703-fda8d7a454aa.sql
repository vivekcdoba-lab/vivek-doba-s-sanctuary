-- Add visibility column with default 'all' so existing rows stay visible to everyone
ALTER TABLE public.learning_content
  ADD COLUMN IF NOT EXISTS visibility text NOT NULL DEFAULT 'all'
  CHECK (visibility IN ('admin_only','admin_coach','all'));

CREATE INDEX IF NOT EXISTS idx_learning_content_visibility
  ON public.learning_content(visibility);

-- Replace permissive seeker/coach SELECT policy with visibility-aware one.
-- Admins keep their existing "Admins manage all learning content" ALL policy.
DROP POLICY IF EXISTS "Anyone can view active learning content" ON public.learning_content;

CREATE POLICY "Coaches view admin_coach and all content"
  ON public.learning_content FOR SELECT TO authenticated
  USING (
    is_active = true
    AND visibility IN ('admin_coach','all')
    AND public.is_coach(auth.uid())
  );

CREATE POLICY "Seekers view all-visibility content"
  ON public.learning_content FOR SELECT TO authenticated
  USING (
    is_active = true
    AND visibility = 'all'
    AND NOT public.is_admin(auth.uid())
    AND NOT public.is_coach(auth.uid())
  );