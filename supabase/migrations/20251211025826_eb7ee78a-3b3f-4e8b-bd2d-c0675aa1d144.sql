-- Add welcome_email_sent column to profiles table
ALTER TABLE public.profiles 
ADD COLUMN welcome_email_sent boolean NOT NULL DEFAULT false;

-- Add welcome_email_sent_at timestamp for audit purposes
ALTER TABLE public.profiles 
ADD COLUMN welcome_email_sent_at timestamp with time zone;