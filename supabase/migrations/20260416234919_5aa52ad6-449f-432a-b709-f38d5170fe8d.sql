
-- Default new reviews to unapproved; require server-side moderation to approve
ALTER TABLE public.reviews ALTER COLUMN approved SET DEFAULT false;

-- Drop old insert policy and replace with one that forces approved=false on insert
DROP POLICY IF EXISTS "Authenticated users can create reviews" ON public.reviews;

CREATE POLICY "Authenticated users can create reviews"
ON public.reviews
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id AND approved = false);

-- Prevent users from updating their own reviews to flip approved=true.
-- (Existing admin ALL policy still lets admins manage everything.)
-- No user UPDATE policy exists, so users cannot update at all — good.
