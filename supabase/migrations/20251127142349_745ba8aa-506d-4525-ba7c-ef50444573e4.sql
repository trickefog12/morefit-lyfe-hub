-- Create IP whitelist table
CREATE TABLE IF NOT EXISTS public.ip_whitelist (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ip_address TEXT NOT NULL UNIQUE,
  description TEXT,
  added_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for fast lookups
CREATE INDEX IF NOT EXISTS idx_ip_whitelist_ip ON public.ip_whitelist(ip_address);

-- Enable RLS
ALTER TABLE public.ip_whitelist ENABLE ROW LEVEL SECURITY;

-- Admins can manage whitelist
CREATE POLICY "Admins can manage IP whitelist"
ON public.ip_whitelist
FOR ALL
TO authenticated
USING (has_role(auth.uid(), 'admin'))
WITH CHECK (has_role(auth.uid(), 'admin'));

-- Service role can read whitelist
CREATE POLICY "Service role can read IP whitelist"
ON public.ip_whitelist
FOR SELECT
TO service_role
USING (true);

-- Create trigger for updated_at
CREATE TRIGGER update_ip_whitelist_updated_at
BEFORE UPDATE ON public.ip_whitelist
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();