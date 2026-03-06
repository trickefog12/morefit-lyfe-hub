
-- Fix 1: profiles - replace raw subquery policy with has_role() function
-- to prevent authenticated users from reading other users' email addresses
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;

CREATE POLICY "Admins can view all profiles"
ON public.profiles FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

-- Also explicitly block any authenticated user who is not the owner and not an admin
-- The "Users can view their own profile" and "Deny anonymous access" already exist,
-- but there is no explicit policy preventing authenticated non-owners from querying.
-- With restrictive (PERMISSIVE=No) policies, only rows matching a permissive policy pass.
-- All existing SELECT policies are already restrictive-friendly, but let's add a
-- belt-and-suspenders explicit denial for non-owner authenticated users on profiles.
-- (Existing permissive policies: own profile OR admin → all others denied by default)

-- Fix 2: purchases - replace raw subquery admin SELECT policy with has_role()
DROP POLICY IF EXISTS "Admins can view all purchases" ON public.purchases;

CREATE POLICY "Admins can view all purchases"
ON public.purchases FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

-- Fix 3: purchases - replace raw subquery admin UPDATE policy with has_role()
DROP POLICY IF EXISTS "Admins can update purchase status" ON public.purchases;

CREATE POLICY "Admins can update purchase status"
ON public.purchases FOR UPDATE
USING (has_role(auth.uid(), 'admin'::app_role));

-- Fix 4: pending_checkouts - replace raw subquery admin SELECT policy with has_role()
DROP POLICY IF EXISTS "Admins can view all pending checkouts" ON public.pending_checkouts;

CREATE POLICY "Admins can view all pending checkouts"
ON public.pending_checkouts FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

-- Fix 5: audit_logs - replace raw subquery policies with has_role()
DROP POLICY IF EXISTS "Admins can view audit logs" ON public.audit_logs;
DROP POLICY IF EXISTS "Admins can insert audit logs" ON public.audit_logs;

CREATE POLICY "Admins can view audit logs"
ON public.audit_logs FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can insert audit logs"
ON public.audit_logs FOR INSERT
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Fix 6: analytics tables - replace raw subquery admin SELECT policies with has_role()
DROP POLICY IF EXISTS "Admins can view all analytics events" ON public.analytics_events;
DROP POLICY IF EXISTS "Admins can view all page views" ON public.analytics_page_views;

CREATE POLICY "Admins can view all analytics events"
ON public.analytics_events FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can view all page views"
ON public.analytics_page_views FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));
