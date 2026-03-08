-- Drop the overly permissive "Service role can read IP whitelist" policy.
-- USING (true) grants public read access to all IP whitelist entries.
-- The service_role key bypasses RLS natively, so this explicit policy is unnecessary and insecure.
DROP POLICY IF EXISTS "Service role can read IP whitelist" ON public.ip_whitelist;