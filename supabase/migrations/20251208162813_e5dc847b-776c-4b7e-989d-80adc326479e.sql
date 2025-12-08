-- Drop the overly permissive purchase insertion policy
DROP POLICY IF EXISTS "Allow purchase insertions" ON public.purchases;

-- Create a proper policy that only allows authenticated users to insert their own purchases
-- Note: The actual purchase creation should be done via edge function with service role for Stripe webhooks
CREATE POLICY "Authenticated users can insert own purchases"
ON public.purchases
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Also ensure the analytics tables require authentication for inserts
DROP POLICY IF EXISTS "Anyone can insert analytics events" ON public.analytics_events;
DROP POLICY IF EXISTS "Anyone can insert page views" ON public.analytics_page_views;

-- Require authentication for analytics event insertion
CREATE POLICY "Authenticated users can insert analytics events"
ON public.analytics_events
FOR INSERT
TO authenticated
WITH CHECK (true);

-- Require authentication for page view insertion
CREATE POLICY "Authenticated users can insert page views"
ON public.analytics_page_views
FOR INSERT
TO authenticated
WITH CHECK (true);