-- Add SELECT policy for users to view their own download limits
CREATE POLICY "Users can view their own download limits"
  ON public.download_limits
  FOR SELECT
  USING (auth.uid() = user_id);

-- Add SELECT policy for users to view their own pending checkouts
CREATE POLICY "Users can view their own pending checkouts"
  ON public.pending_checkouts
  FOR SELECT
  USING (auth.uid() = user_id);

-- Add SELECT policy for admins to view all analytics events
CREATE POLICY "Admins can view all analytics events"
  ON public.analytics_events
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_roles.user_id = auth.uid()
      AND user_roles.role = 'admin'
    )
  );

-- Add SELECT policy for admins to view all page views
CREATE POLICY "Admins can view all page views"
  ON public.analytics_page_views
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_roles.user_id = auth.uid()
      AND user_roles.role = 'admin'
    )
  );

-- Add UPDATE policy for admins to update purchase status
CREATE POLICY "Admins can update purchase status"
  ON public.purchases
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_roles.user_id = auth.uid()
      AND user_roles.role = 'admin'
    )
  );