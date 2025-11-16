-- Fix the purchases table RLS policy to allow insertions
-- The current policy has WITH CHECK = false which blocks ALL inserts

-- Drop the broken policy
DROP POLICY IF EXISTS "Service role can insert purchases" ON purchases;

-- Create a proper policy that allows insertions
-- Service role bypasses RLS, but this ensures proper access
CREATE POLICY "Allow purchase insertions"
  ON purchases
  FOR INSERT
  WITH CHECK (true);