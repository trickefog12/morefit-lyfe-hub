-- Drop the vulnerable policy that allows authenticated users to insert completed purchases directly
DROP POLICY IF EXISTS "Authenticated users can insert own purchases" ON public.purchases;

-- Replace with a policy that blocks ALL direct client inserts.
-- The Stripe webhook uses SUPABASE_SERVICE_ROLE_KEY which bypasses RLS entirely,
-- so legitimate purchases via webhook are unaffected.
CREATE POLICY "Block direct purchase inserts"
  ON public.purchases
  FOR INSERT
  WITH CHECK (false);