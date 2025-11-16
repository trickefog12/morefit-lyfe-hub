-- Create admin notification preferences table
CREATE TABLE public.admin_notification_preferences (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  action_type text NOT NULL,
  email_enabled boolean NOT NULL DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(admin_id, action_type)
);

-- Enable RLS
ALTER TABLE public.admin_notification_preferences ENABLE ROW LEVEL SECURITY;

-- Admins can manage their own notification preferences
CREATE POLICY "Admins can view own preferences"
ON public.admin_notification_preferences
FOR SELECT
USING (auth.uid() = admin_id AND has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update own preferences"
ON public.admin_notification_preferences
FOR UPDATE
USING (auth.uid() = admin_id AND has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can insert own preferences"
ON public.admin_notification_preferences
FOR INSERT
WITH CHECK (auth.uid() = admin_id AND has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete own preferences"
ON public.admin_notification_preferences
FOR DELETE
USING (auth.uid() = admin_id AND has_role(auth.uid(), 'admin'));

-- Add trigger for updated_at
CREATE TRIGGER update_admin_notification_preferences_updated_at
BEFORE UPDATE ON public.admin_notification_preferences
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();