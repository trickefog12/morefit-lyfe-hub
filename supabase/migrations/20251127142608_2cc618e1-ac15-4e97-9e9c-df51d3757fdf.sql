-- Add is_cidr flag to distinguish CIDR ranges from individual IPs
ALTER TABLE public.ip_whitelist 
ADD COLUMN IF NOT EXISTS is_cidr BOOLEAN DEFAULT false;

-- Create function to check if an IP matches any whitelisted IP or CIDR range
CREATE OR REPLACE FUNCTION public.is_ip_whitelisted(check_ip TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Check if IP matches any individual IP or falls within any CIDR range
  RETURN EXISTS (
    SELECT 1 
    FROM public.ip_whitelist 
    WHERE 
      -- Direct IP match
      (is_cidr = false AND ip_address = check_ip)
      OR
      -- CIDR range match using PostgreSQL inet operators
      (is_cidr = true AND check_ip::inet <<= ip_address::inet)
  );
END;
$$;