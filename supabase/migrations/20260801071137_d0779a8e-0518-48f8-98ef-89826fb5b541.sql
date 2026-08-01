REVOKE ALL ON FUNCTION public.consume_workshop_credit(uuid) FROM anon, public;
GRANT EXECUTE ON FUNCTION public.consume_workshop_credit(uuid) TO authenticated, service_role;

REVOKE ALL ON FUNCTION public.enrollment_apply_course_defaults() FROM anon, public;
REVOKE ALL ON FUNCTION public.enforce_session_cap() FROM anon, public;
REVOKE ALL ON FUNCTION public.release_session_slot() FROM anon, public;
REVOKE ALL ON FUNCTION public.award_assignment_credits() FROM anon, public;