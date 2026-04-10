
-- Create meal plan waitlist table
CREATE TABLE public.meal_plan_waitlist (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL,
  goal TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add unique constraint on email to prevent duplicates
ALTER TABLE public.meal_plan_waitlist ADD CONSTRAINT meal_plan_waitlist_email_unique UNIQUE (email);

-- Enable RLS
ALTER TABLE public.meal_plan_waitlist ENABLE ROW LEVEL SECURITY;

-- Allow anyone (anon + authenticated) to insert
CREATE POLICY "Anyone can join waitlist"
ON public.meal_plan_waitlist
FOR INSERT
TO anon, authenticated
WITH CHECK (true);

-- Only admins can read waitlist entries
CREATE POLICY "Admins can view waitlist"
ON public.meal_plan_waitlist
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));
