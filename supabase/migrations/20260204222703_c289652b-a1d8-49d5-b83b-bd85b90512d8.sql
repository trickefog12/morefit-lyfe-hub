-- Create a public view that hides user_id and only shows approved reviews with reviewer names
CREATE OR REPLACE VIEW public.reviews_public
WITH (security_invoker = on)
AS
SELECT 
  r.id,
  r.rating,
  r.comment,
  r.created_at,
  COALESCE(p.full_name, 'Anonymous') as reviewer_name
FROM public.reviews r
LEFT JOIN public.profiles p ON r.user_id = p.id
WHERE r.approved = true;

-- Grant access to the view
GRANT SELECT ON public.reviews_public TO anon;
GRANT SELECT ON public.reviews_public TO authenticated;

-- Drop the permissive "Anyone can view all reviews" policy that exposes user_id
DROP POLICY IF EXISTS "Anyone can view all reviews" ON public.reviews;