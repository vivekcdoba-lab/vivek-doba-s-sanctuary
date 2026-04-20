UPDATE public.profiles
SET is_also_coach = false
WHERE email IN ('vivekcdoba@gmail.com', 'dobaarchana@gmail.com');

DELETE FROM public.profiles
WHERE email IN ('vivekcdoba@gmail.com', 'dobaarchana@gmail.com')
  AND role = 'coach';