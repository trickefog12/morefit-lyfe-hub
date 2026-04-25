-- Remove legacy rows with null user_id (they predate strict ownership enforcement)
DELETE FROM public.analytics_events WHERE user_id IS NULL;
DELETE FROM public.analytics_page_views WHERE user_id IS NULL;

-- Tighten authenticated insert policies to require non-null user_id matching auth.uid()
DROP POLICY IF EXISTS "Authenticated users can insert own analytics events" ON public.analytics_events;
CREATE POLICY "Authenticated users can insert own analytics events"
  ON public.analytics_events
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id IS NOT NULL AND auth.uid() = user_id);

DROP POLICY IF EXISTS "Authenticated users can insert own page views" ON public.analytics_page_views;
CREATE POLICY "Authenticated users can insert own page views"
  ON public.analytics_page_views
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id IS NOT NULL AND auth.uid() = user_id);

-- Enforce NOT NULL at the column level
ALTER TABLE public.analytics_events ALTER COLUMN user_id SET NOT NULL;
ALTER TABLE public.analytics_page_views ALTER COLUMN user_id SET NOT NULL;