-- Fix 1: ip_whitelist — deny non-admin authenticated users from reading
-- The existing "Admins can manage IP whitelist" ALL policy already covers admin access.
-- Add an explicit deny for the authenticated role so non-admins cannot SELECT.
CREATE POLICY "Deny non-admin select on ip_whitelist"
ON public.ip_whitelist
FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

-- Also deny anonymous access
CREATE POLICY "Deny anonymous access to ip_whitelist"
ON public.ip_whitelist
FOR SELECT
TO anon
USING (false);

-- Fix 2: user_roles — prevent privilege escalation
-- Drop the overly broad ALL policy and replace with explicit per-command policies
DROP POLICY IF EXISTS "Admins can manage roles" ON public.user_roles;

-- Admins can INSERT roles
CREATE POLICY "Admins can insert roles"
ON public.user_roles
FOR INSERT
TO authenticated
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Admins can UPDATE roles
CREATE POLICY "Admins can update roles"
ON public.user_roles
FOR UPDATE
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

-- Admins can DELETE roles
CREATE POLICY "Admins can delete roles"
ON public.user_roles
FOR DELETE
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

-- Deny anonymous access entirely
CREATE POLICY "Deny anonymous access to user_roles"
ON public.user_roles
FOR ALL
TO anon
USING (false)
WITH CHECK (false);