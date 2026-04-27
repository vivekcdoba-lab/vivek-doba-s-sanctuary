INSERT INTO public.app_settings (key, value)
VALUES ('email_from', '"VDTS <info@notify.vivekdoba.com>"'::jsonb)
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = now();