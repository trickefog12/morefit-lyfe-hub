-- 1. Explicitly deny anonymous INSERT on analytics_page_views
CREATE POLICY "Deny anonymous insert to analytics_page_views"
  ON public.analytics_page_views
  FOR INSERT
  TO anon
  WITH CHECK (false);

-- Also deny anonymous INSERT on analytics_events for consistency
CREATE POLICY "Deny anonymous insert to analytics_events"
  ON public.analytics_events
  FOR INSERT
  TO anon
  WITH CHECK (false);

-- 2. Tighten realtime broadcast access for audit_logs
-- Ensure realtime.messages SELECT requires admin role and scopes topic to audit_logs channel
DO $$
BEGIN
  -- Drop any overly permissive existing policies on realtime.messages we may have added
  IF EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'realtime' AND tablename = 'messages' 
      AND policyname = 'Admins can receive audit log broadcasts'
  ) THEN
    DROP POLICY "Admins can receive audit log broadcasts" ON realtime.messages;
  END IF;
END $$;

-- Restrict realtime subscription on audit_logs topic to admins only,
-- and only for the dedicated audit-logs topic channel
CREATE POLICY "Admins can receive audit log broadcasts"
  ON realtime.messages
  FOR SELECT
  TO authenticated
  USING (
    public.has_role(auth.uid(), 'admin'::public.app_role)
    AND realtime.topic() LIKE 'audit-logs:%'
  );