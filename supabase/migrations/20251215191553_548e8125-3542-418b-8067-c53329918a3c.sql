-- Add explicit RLS policies to deny unauthenticated access for error-level security issues

-- 1. PROFILES TABLE: Ensure only authenticated users can read their own profile
-- First, check if the restrictive policy exists and drop it to recreate properly
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Profiles are viewable by owners only" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;

-- Create restrictive policies for profiles
CREATE POLICY "Users can view their own profile" 
  ON public.profiles 
  FOR SELECT 
  USING (auth.uid() = id);

CREATE POLICY "Admins can view all profiles" 
  ON public.profiles 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- 2. PURCHASES TABLE: Ensure only authenticated users can view their own purchases
DROP POLICY IF EXISTS "Users can view own purchases" ON public.purchases;
DROP POLICY IF EXISTS "Admins can view all purchases" ON public.purchases;

CREATE POLICY "Users can view own purchases" 
  ON public.purchases 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all purchases" 
  ON public.purchases 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- 3. PENDING_CHECKOUTS TABLE: Only owners and admins can access
DROP POLICY IF EXISTS "Users can view own pending checkouts" ON public.pending_checkouts;
DROP POLICY IF EXISTS "Users can insert own pending checkouts" ON public.pending_checkouts;
DROP POLICY IF EXISTS "Users can delete own pending checkouts" ON public.pending_checkouts;
DROP POLICY IF EXISTS "Admins can view all pending checkouts" ON public.pending_checkouts;

CREATE POLICY "Users can view own pending checkouts" 
  ON public.pending_checkouts 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own pending checkouts" 
  ON public.pending_checkouts 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own pending checkouts" 
  ON public.pending_checkouts 
  FOR DELETE 
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all pending checkouts" 
  ON public.pending_checkouts 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- 4. AUDIT_LOGS TABLE: Only admins can access (already should be admin-only, reinforce it)
DROP POLICY IF EXISTS "Admins can view audit logs" ON public.audit_logs;
DROP POLICY IF EXISTS "Admins can insert audit logs" ON public.audit_logs;

CREATE POLICY "Admins can view audit logs" 
  ON public.audit_logs 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can insert audit logs" 
  ON public.audit_logs 
  FOR INSERT 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );