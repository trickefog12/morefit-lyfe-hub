-- Add policy to allow users to delete their own reviews (GDPR compliance)
CREATE POLICY "Users can delete their own reviews"
ON public.reviews
FOR DELETE
USING (auth.uid() = user_id);