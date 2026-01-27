-- Change default for new reviews to be auto-approved
ALTER TABLE public.reviews ALTER COLUMN approved SET DEFAULT true;

-- Drop old RLS policy that only shows approved reviews
DROP POLICY IF EXISTS "Anyone can view approved reviews" ON public.reviews;

-- Create new policy to show all reviews (moderation happens before insert)
CREATE POLICY "Anyone can view all reviews" 
ON public.reviews 
FOR SELECT 
USING (true);