-- Allow service role to delete old analytics data
CREATE POLICY "Service role can delete analytics events"
ON public.analytics_events
FOR DELETE
USING (true);

CREATE POLICY "Service role can delete page views"
ON public.analytics_page_views
FOR DELETE
USING (true);
