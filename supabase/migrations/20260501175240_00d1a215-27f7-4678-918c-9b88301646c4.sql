-- Backfill lgt_applications from legacy submissions (form_type='lgt_application')
-- Match by lower(email). Insert one row per seeker who has no existing lgt_applications row.
INSERT INTO public.lgt_applications (
  seeker_id, status, filled_by_role, submitted_at, form_data, version, created_at, updated_at
)
SELECT DISTINCT ON (p.id)
  p.id,
  'submitted',
  'seeker',
  s.created_at,
  s.form_data,
  1,
  s.created_at,
  now()
FROM public.submissions s
JOIN public.profiles p ON lower(p.email) = lower(s.email)
WHERE s.form_type = 'lgt_application'
  AND s.email IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM public.lgt_applications la WHERE la.seeker_id = p.id
  )
ORDER BY p.id, s.created_at DESC;