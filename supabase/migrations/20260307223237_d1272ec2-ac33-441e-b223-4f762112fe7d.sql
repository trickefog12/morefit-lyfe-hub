
-- Fix 1: Drop the overly permissive "Service role can manage pending checkouts" policy.
-- The service_role key bypasses RLS entirely, so no explicit policy is needed.
-- Proper user-specific and admin policies already exist on this table.
DROP POLICY IF EXISTS "Service role can manage pending checkouts" ON public.pending_checkouts;

-- Fix 2: Drop the overly permissive "Service role can manage rate limits" policy.
-- Edge functions that write rate_limit_logs use the service_role key which bypasses RLS.
DROP POLICY IF EXISTS "Service role can manage rate limits" ON public.rate_limit_logs;

-- Deny all direct access to rate_limit_logs from authenticated users
CREATE POLICY "Deny authenticated access to rate_limit_logs"
  ON public.rate_limit_logs
  FOR ALL
  TO authenticated
  USING (false)
  WITH CHECK (false);

-- Deny all direct access to rate_limit_logs from anonymous users
CREATE POLICY "Deny anonymous access to rate_limit_logs"
  ON public.rate_limit_logs
  FOR ALL
  TO anon
  USING (false)
  WITH CHECK (false);
