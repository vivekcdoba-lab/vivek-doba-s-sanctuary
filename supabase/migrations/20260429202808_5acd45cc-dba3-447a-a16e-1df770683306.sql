DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM cron.job WHERE jobname='send-daily-seeker-reports') THEN
    PERFORM cron.unschedule('send-daily-seeker-reports');
  END IF;
END $$;

SELECT cron.schedule(
  'send-daily-seeker-reports',
  '0 15 * * *',
  $$
  select net.http_post(
    url:='https://pobjadmnmfbeydqsymhx.supabase.co/functions/v1/send-daily-seeker-reports',
    headers:='{"Content-Type":"application/json","apikey":"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBvYmphZG1ubWZiZXlkcXN5bWh4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ5NTc2MjcsImV4cCI6MjA5MDUzMzYyN30.kkKrrarea6Gf9gaG53Qwca9bnFTRys_m5gQOiancIw8","Authorization":"Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBvYmphZG1ubWZiZXlkcXN5bWh4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ5NTc2MjcsImV4cCI6MjA5MDUzMzYyN30.kkKrrarea6Gf9gaG53Qwca9bnFTRys_m5gQOiancIw8"}'::jsonb,
    body:='{}'::jsonb
  );
  $$
);