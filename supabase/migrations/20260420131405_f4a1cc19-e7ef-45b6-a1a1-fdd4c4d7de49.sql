-- Explicitly deny anonymous SELECT on analytics tables to close
-- the theoretical gap where rows with NULL user_id could be visible to anon.
CREATE POLICY "Deny anonymous access to analytics_events"
  ON public.analytics_events
  FOR SELECT
  TO anon
  USING (false);

CREATE POLICY "Deny anonymous access to analytics_page_views"
  ON public.analytics_page_views
  FOR SELECT
  TO anon
  USING (false);