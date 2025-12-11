-- Create email_templates table for storing customized templates
CREATE TABLE public.email_templates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  template_type TEXT NOT NULL UNIQUE DEFAULT 'welcome',
  subject TEXT NOT NULL DEFAULT 'Welcome to MoreFitLyfe!',
  heading TEXT NOT NULL DEFAULT 'Welcome to MoreFitLyfe! 🎉',
  greeting_prefix TEXT NOT NULL DEFAULT 'Hi',
  intro_text TEXT NOT NULL DEFAULT 'Thank you for verifying your email and joining the MoreFitLyfe community! We''re excited to have you on board.',
  body_text TEXT NOT NULL DEFAULT 'You''re now ready to explore our professional strength training and transformation programs designed for real results.',
  cta_button_text TEXT NOT NULL DEFAULT 'Browse Our Programs',
  features_heading TEXT NOT NULL DEFAULT 'What you can do now:',
  feature_1 TEXT NOT NULL DEFAULT 'Browse our training programs',
  feature_2 TEXT NOT NULL DEFAULT 'Check out our meal plans',
  feature_3 TEXT NOT NULL DEFAULT 'Start your transformation journey',
  footer_text TEXT NOT NULL DEFAULT 'Let''s get stronger together!',
  signature TEXT NOT NULL DEFAULT 'Stefania & The MoreFitLyfe Team',
  primary_color TEXT NOT NULL DEFAULT '#FF6B35',
  background_color TEXT NOT NULL DEFAULT '#f6f9fc',
  text_color TEXT NOT NULL DEFAULT '#333333',
  updated_by UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.email_templates ENABLE ROW LEVEL SECURITY;

-- Only admins can view and manage templates
CREATE POLICY "Admins can manage email templates"
ON public.email_templates
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Create trigger for updated_at
CREATE TRIGGER update_email_templates_updated_at
BEFORE UPDATE ON public.email_templates
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default welcome template
INSERT INTO public.email_templates (template_type) VALUES ('welcome');