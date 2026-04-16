-- 1. Restrict analytics inserts to authenticated users only (no more user_id IS NULL bypass)
DROP POLICY IF EXISTS "Authenticated users can insert own analytics events" ON public.analytics_events;
CREATE POLICY "Authenticated users can insert own analytics events"
ON public.analytics_events
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Authenticated users can insert own page views" ON public.analytics_page_views;
CREATE POLICY "Authenticated users can insert own page views"
ON public.analytics_page_views
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- 2. Tighten meal_plan_waitlist INSERT — keep public access but add minimal validation
DROP POLICY IF EXISTS "Anyone can join waitlist" ON public.meal_plan_waitlist;
CREATE POLICY "Anyone can join waitlist"
ON public.meal_plan_waitlist
FOR INSERT
TO anon, authenticated
WITH CHECK (
  email IS NOT NULL
  AND length(email) BETWEEN 5 AND 254
  AND email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'
  AND (goal IS NULL OR length(goal) <= 500)
);

-- 3. Restrict Realtime channel subscriptions to admins only
-- Enable RLS on realtime.messages and add admin-only policy for audit_logs topic
ALTER TABLE IF EXISTS realtime.messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can subscribe to realtime channels" ON realtime.messages;
CREATE POLICY "Admins can subscribe to realtime channels"
ON realtime.messages
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::public.app_role));

DROP POLICY IF EXISTS "Admins can broadcast to realtime channels" ON realtime.messages;
CREATE POLICY "Admins can broadcast to realtime channels"
ON realtime.messages
FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));