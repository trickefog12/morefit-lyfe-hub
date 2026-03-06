
-- Fix 1: Replace open USING(true) DELETE policies on analytics tables with admin-only checks
-- Service role bypasses RLS entirely, so these policies were inadvertently granting
-- DELETE to all anon/authenticated users.

DROP POLICY IF EXISTS "Service role can delete analytics events" ON public.analytics_events;
DROP POLICY IF EXISTS "Service role can delete page views" ON public.analytics_page_views;

CREATE POLICY "Admins can delete analytics events"
ON public.analytics_events FOR DELETE
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete page views"
ON public.analytics_page_views FOR DELETE
USING (has_role(auth.uid(), 'admin'::app_role));

-- Fix 2: Grant SELECT on the reviews_public view to anonymous and authenticated roles
-- The view only exposes safe, non-PII columns (id, rating, comment, created_at, reviewer_name)
GRANT SELECT ON public.reviews_public TO anon;
GRANT SELECT ON public.reviews_public TO authenticated;
