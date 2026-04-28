ALTER TABLE public.courses
  ADD COLUMN IF NOT EXISTS lifecycle_status text NOT NULL DEFAULT 'active';

UPDATE public.courses
  SET lifecycle_status = CASE WHEN is_active = false THEN 'deactivated' ELSE 'active' END
  WHERE lifecycle_status = 'active';

ALTER TABLE public.courses
  DROP CONSTRAINT IF EXISTS courses_lifecycle_status_check;

ALTER TABLE public.courses
  ADD CONSTRAINT courses_lifecycle_status_check
  CHECK (lifecycle_status IN ('active','upcoming','completed','deactivated'));

CREATE INDEX IF NOT EXISTS idx_courses_lifecycle_status ON public.courses(lifecycle_status);