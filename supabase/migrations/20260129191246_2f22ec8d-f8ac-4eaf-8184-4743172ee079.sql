-- Add explicit deny policies for anonymous users on email_templates
CREATE POLICY "Deny anonymous access to email_templates" 
ON public.email_templates 
FOR SELECT 
USING (false);

CREATE POLICY "Deny anonymous insert to email_templates" 
ON public.email_templates 
FOR INSERT 
WITH CHECK (false);

CREATE POLICY "Deny anonymous update to email_templates" 
ON public.email_templates 
FOR UPDATE 
USING (false);

CREATE POLICY "Deny anonymous delete to email_templates" 
ON public.email_templates 
FOR DELETE 
USING (false);