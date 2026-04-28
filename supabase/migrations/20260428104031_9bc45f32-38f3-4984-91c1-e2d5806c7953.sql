ALTER TABLE public.agreements
  DROP CONSTRAINT IF EXISTS agreements_client_id_fkey;

ALTER TABLE public.agreements
  ADD CONSTRAINT agreements_client_id_fkey
  FOREIGN KEY (client_id) REFERENCES public.profiles(id) ON DELETE CASCADE;