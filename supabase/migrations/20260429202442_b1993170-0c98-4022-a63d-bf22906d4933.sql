REVOKE EXECUTE ON FUNCTION public.get_seeker_daily_summary(uuid, date) FROM anon, public;
GRANT EXECUTE ON FUNCTION public.get_seeker_daily_summary(uuid, date) TO authenticated, service_role;