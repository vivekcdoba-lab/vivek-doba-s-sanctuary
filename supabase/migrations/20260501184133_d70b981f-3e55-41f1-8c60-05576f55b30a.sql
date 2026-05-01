CREATE OR REPLACE FUNCTION public.get_linked_seekers_basic(_seeker_id uuid)
RETURNS TABLE (
  link_id uuid,
  group_id uuid,
  partner_id uuid,
  full_name text,
  email text,
  relationship text,
  relationship_label text
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  WITH grp AS (
    SELECT group_id FROM public.seeker_links WHERE seeker_id = _seeker_id LIMIT 1
  )
  SELECT
    sl.id           AS link_id,
    sl.group_id     AS group_id,
    p.id            AS partner_id,
    p.full_name     AS full_name,
    p.email         AS email,
    sl.relationship::text AS relationship,
    sl.relationship_label
  FROM public.seeker_links sl
  JOIN public.profiles p ON p.id = sl.seeker_id
  WHERE sl.group_id = (SELECT group_id FROM grp)
    AND sl.seeker_id <> _seeker_id;
$$;

GRANT EXECUTE ON FUNCTION public.get_linked_seekers_basic(uuid) TO authenticated;