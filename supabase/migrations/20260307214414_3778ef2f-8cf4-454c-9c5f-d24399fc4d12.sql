-- Fix: Drop all access-granting (incorrectly RESTRICTIVE) policies and recreate as PERMISSIVE.
-- Only the explicit DENY / anonymous-block policies will remain RESTRICTIVE.

-- ============================================================
-- profiles
-- ============================================================
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;

CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Admins can view all profiles"
  ON public.profiles FOR SELECT
  USING (has_role(auth.uid(), 'admin'::app_role));

-- ============================================================
-- purchases
-- ============================================================
DROP POLICY IF EXISTS "Users can view own purchases" ON public.purchases;
DROP POLICY IF EXISTS "Admins can view all purchases" ON public.purchases;
DROP POLICY IF EXISTS "Admins can update purchase status" ON public.purchases;

CREATE POLICY "Users can view own purchases"
  ON public.purchases FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all purchases"
  ON public.purchases FOR SELECT
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update purchase status"
  ON public.purchases FOR UPDATE
  USING (has_role(auth.uid(), 'admin'::app_role));

-- ============================================================
-- user_roles
-- ============================================================
DROP POLICY IF EXISTS "Users can view their own roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can view all roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can manage roles" ON public.user_roles;

CREATE POLICY "Users can view their own roles"
  ON public.user_roles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all roles"
  ON public.user_roles FOR SELECT
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can manage roles"
  ON public.user_roles FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role));

-- ============================================================
-- products
-- ============================================================
DROP POLICY IF EXISTS "Anyone can view active products" ON public.products;
DROP POLICY IF EXISTS "Admins can manage products" ON public.products;

CREATE POLICY "Anyone can view active products"
  ON public.products FOR SELECT
  USING (active = true);

CREATE POLICY "Admins can manage products"
  ON public.products FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role));

-- ============================================================
-- reviews
-- ============================================================
DROP POLICY IF EXISTS "Admins can manage all reviews" ON public.reviews;
DROP POLICY IF EXISTS "Authenticated users can create reviews" ON public.reviews;
DROP POLICY IF EXISTS "Users can delete their own reviews" ON public.reviews;
DROP POLICY IF EXISTS "Users can view their own reviews" ON public.reviews;

CREATE POLICY "Admins can manage all reviews"
  ON public.reviews FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Authenticated users can create reviews"
  ON public.reviews FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own reviews"
  ON public.reviews FOR DELETE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own reviews"
  ON public.reviews FOR SELECT
  USING (auth.uid() = user_id);

-- ============================================================
-- pending_checkouts
-- ============================================================
DROP POLICY IF EXISTS "Users can view own pending checkouts" ON public.pending_checkouts;
DROP POLICY IF EXISTS "Users can view their own pending checkouts" ON public.pending_checkouts;
DROP POLICY IF EXISTS "Users can insert own pending checkouts" ON public.pending_checkouts;
DROP POLICY IF EXISTS "Users can delete own pending checkouts" ON public.pending_checkouts;
DROP POLICY IF EXISTS "Admins can view all pending checkouts" ON public.pending_checkouts;
DROP POLICY IF EXISTS "Service role can manage pending checkouts" ON public.pending_checkouts;

CREATE POLICY "Users can view own pending checkouts"
  ON public.pending_checkouts FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own pending checkouts"
  ON public.pending_checkouts FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own pending checkouts"
  ON public.pending_checkouts FOR DELETE
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all pending checkouts"
  ON public.pending_checkouts FOR SELECT
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Service role can manage pending checkouts"
  ON public.pending_checkouts FOR ALL
  USING (true)
  WITH CHECK (true);

-- ============================================================
-- audit_logs
-- ============================================================
DROP POLICY IF EXISTS "Admins can create audit logs" ON public.audit_logs;
DROP POLICY IF EXISTS "Admins can insert audit logs" ON public.audit_logs;
DROP POLICY IF EXISTS "Admins can view audit logs" ON public.audit_logs;

CREATE POLICY "Admins can view audit logs"
  ON public.audit_logs FOR SELECT
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can insert audit logs"
  ON public.audit_logs FOR INSERT
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- ============================================================
-- email_templates
-- ============================================================
DROP POLICY IF EXISTS "Admins can manage email templates" ON public.email_templates;

CREATE POLICY "Admins can manage email templates"
  ON public.email_templates FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- ============================================================
-- download_limits
-- ============================================================
DROP POLICY IF EXISTS "Admins can manage download limits" ON public.download_limits;
DROP POLICY IF EXISTS "Users can view their own download limits" ON public.download_limits;

CREATE POLICY "Admins can manage download limits"
  ON public.download_limits FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Users can view their own download limits"
  ON public.download_limits FOR SELECT
  USING (auth.uid() = user_id);

-- ============================================================
-- ip_whitelist
-- ============================================================
DROP POLICY IF EXISTS "Admins can manage IP whitelist" ON public.ip_whitelist;
DROP POLICY IF EXISTS "Service role can read IP whitelist" ON public.ip_whitelist;

CREATE POLICY "Admins can manage IP whitelist"
  ON public.ip_whitelist FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Service role can read IP whitelist"
  ON public.ip_whitelist FOR SELECT
  USING (true);

-- ============================================================
-- admin_notification_preferences
-- ============================================================
DROP POLICY IF EXISTS "Admins can delete own preferences" ON public.admin_notification_preferences;
DROP POLICY IF EXISTS "Admins can insert own preferences" ON public.admin_notification_preferences;
DROP POLICY IF EXISTS "Admins can update own preferences" ON public.admin_notification_preferences;
DROP POLICY IF EXISTS "Admins can view own preferences" ON public.admin_notification_preferences;

CREATE POLICY "Admins can view own preferences"
  ON public.admin_notification_preferences FOR SELECT
  USING ((auth.uid() = admin_id) AND has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can insert own preferences"
  ON public.admin_notification_preferences FOR INSERT
  WITH CHECK ((auth.uid() = admin_id) AND has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update own preferences"
  ON public.admin_notification_preferences FOR UPDATE
  USING ((auth.uid() = admin_id) AND has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete own preferences"
  ON public.admin_notification_preferences FOR DELETE
  USING ((auth.uid() = admin_id) AND has_role(auth.uid(), 'admin'::app_role));

-- ============================================================
-- rate_limit_logs
-- ============================================================
DROP POLICY IF EXISTS "Service role can manage rate limits" ON public.rate_limit_logs;

CREATE POLICY "Service role can manage rate limits"
  ON public.rate_limit_logs FOR ALL
  USING (true)
  WITH CHECK (true);

-- ============================================================
-- analytics_events
-- ============================================================
DROP POLICY IF EXISTS "Admins can view all analytics events" ON public.analytics_events;
DROP POLICY IF EXISTS "Admins can delete analytics events" ON public.analytics_events;
DROP POLICY IF EXISTS "Authenticated users can insert own analytics events" ON public.analytics_events;
DROP POLICY IF EXISTS "Users can view their own analytics events" ON public.analytics_events;

CREATE POLICY "Admins can view all analytics events"
  ON public.analytics_events FOR SELECT
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete analytics events"
  ON public.analytics_events FOR DELETE
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Authenticated users can insert own analytics events"
  ON public.analytics_events FOR INSERT
  WITH CHECK ((auth.uid() = user_id) OR (user_id IS NULL));

CREATE POLICY "Users can view their own analytics events"
  ON public.analytics_events FOR SELECT
  USING (auth.uid() = user_id);

-- ============================================================
-- analytics_page_views
-- ============================================================
DROP POLICY IF EXISTS "Admins can view all page views" ON public.analytics_page_views;
DROP POLICY IF EXISTS "Admins can delete page views" ON public.analytics_page_views;
DROP POLICY IF EXISTS "Authenticated users can insert own page views" ON public.analytics_page_views;
DROP POLICY IF EXISTS "Users can view their own page views" ON public.analytics_page_views;

CREATE POLICY "Admins can view all page views"
  ON public.analytics_page_views FOR SELECT
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete page views"
  ON public.analytics_page_views FOR DELETE
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Authenticated users can insert own page views"
  ON public.analytics_page_views FOR INSERT
  WITH CHECK ((auth.uid() = user_id) OR (user_id IS NULL));

CREATE POLICY "Users can view their own page views"
  ON public.analytics_page_views FOR SELECT
  USING (auth.uid() = user_id);