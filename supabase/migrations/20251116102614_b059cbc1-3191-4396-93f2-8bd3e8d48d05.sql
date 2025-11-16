-- Create table for custom download limits
CREATE TABLE public.download_limits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
  role app_role,
  daily_limit integer NOT NULL CHECK (daily_limit > 0),
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT download_limits_target_check CHECK (
    (user_id IS NOT NULL AND role IS NULL) OR 
    (user_id IS NULL AND role IS NOT NULL)
  ),
  CONSTRAINT download_limits_unique_user UNIQUE (user_id),
  CONSTRAINT download_limits_unique_role UNIQUE (role)
);

-- Enable RLS
ALTER TABLE public.download_limits ENABLE ROW LEVEL SECURITY;

-- Admins can manage download limits
CREATE POLICY "Admins can manage download limits"
ON public.download_limits
FOR ALL
USING (has_role(auth.uid(), 'admin'));

-- Create trigger for updated_at
CREATE TRIGGER update_download_limits_updated_at
BEFORE UPDATE ON public.download_limits
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Add index for faster lookups
CREATE INDEX idx_download_limits_user_id ON public.download_limits(user_id);
CREATE INDEX idx_download_limits_role ON public.download_limits(role);