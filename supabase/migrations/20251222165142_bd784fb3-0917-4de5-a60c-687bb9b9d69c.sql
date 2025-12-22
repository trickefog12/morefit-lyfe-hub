-- Add explicit anonymous access denial policies for error-level security issues
-- These policies ensure that unauthenticated users cannot access any data

-- 1. PROFILES TABLE: Add explicit anonymous denial
-- The existing policies use auth.uid() = id, but we need to ensure no anonymous access
DROP POLICY IF EXISTS "Deny anonymous access to profiles" ON public.profiles;
CREATE POLICY "Deny anonymous access to profiles" 
  ON public.profiles 
  FOR SELECT 
  TO anon
  USING (false);

-- 2. PURCHASES TABLE: Add explicit anonymous denial
DROP POLICY IF EXISTS "Deny anonymous access to purchases" ON public.purchases;
CREATE POLICY "Deny anonymous access to purchases" 
  ON public.purchases 
  FOR SELECT 
  TO anon
  USING (false);

-- Also deny INSERT/UPDATE/DELETE for anonymous users
DROP POLICY IF EXISTS "Deny anonymous insert to purchases" ON public.purchases;
CREATE POLICY "Deny anonymous insert to purchases" 
  ON public.purchases 
  FOR INSERT 
  TO anon
  WITH CHECK (false);

DROP POLICY IF EXISTS "Deny anonymous update to purchases" ON public.purchases;
CREATE POLICY "Deny anonymous update to purchases" 
  ON public.purchases 
  FOR UPDATE 
  TO anon
  USING (false);

DROP POLICY IF EXISTS "Deny anonymous delete to purchases" ON public.purchases;
CREATE POLICY "Deny anonymous delete to purchases" 
  ON public.purchases 
  FOR DELETE 
  TO anon
  USING (false);

-- 3. PENDING_CHECKOUTS TABLE: Add explicit anonymous denial
DROP POLICY IF EXISTS "Deny anonymous access to pending_checkouts" ON public.pending_checkouts;
CREATE POLICY "Deny anonymous access to pending_checkouts" 
  ON public.pending_checkouts 
  FOR SELECT 
  TO anon
  USING (false);

DROP POLICY IF EXISTS "Deny anonymous insert to pending_checkouts" ON public.pending_checkouts;
CREATE POLICY "Deny anonymous insert to pending_checkouts" 
  ON public.pending_checkouts 
  FOR INSERT 
  TO anon
  WITH CHECK (false);

DROP POLICY IF EXISTS "Deny anonymous delete to pending_checkouts" ON public.pending_checkouts;
CREATE POLICY "Deny anonymous delete to pending_checkouts" 
  ON public.pending_checkouts 
  FOR DELETE 
  TO anon
  USING (false);

-- 4. AUDIT_LOGS TABLE: Add explicit anonymous denial
DROP POLICY IF EXISTS "Deny anonymous access to audit_logs" ON public.audit_logs;
CREATE POLICY "Deny anonymous access to audit_logs" 
  ON public.audit_logs 
  FOR SELECT 
  TO anon
  USING (false);

DROP POLICY IF EXISTS "Deny anonymous insert to audit_logs" ON public.audit_logs;
CREATE POLICY "Deny anonymous insert to audit_logs" 
  ON public.audit_logs 
  FOR INSERT 
  TO anon
  WITH CHECK (false);