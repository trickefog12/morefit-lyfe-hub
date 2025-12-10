-- Fix analytics_events INSERT policy to enforce user_id validation
DROP POLICY IF EXISTS "Authenticated users can insert analytics events" ON public.analytics_events;
CREATE POLICY "Authenticated users can insert own analytics events"
ON public.analytics_events
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

-- Fix analytics_page_views INSERT policy to enforce user_id validation  
DROP POLICY IF EXISTS "Authenticated users can insert page views" ON public.analytics_page_views;
CREATE POLICY "Authenticated users can insert own page views"
ON public.analytics_page_views
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id OR user_id IS NULL);