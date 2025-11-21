-- Add INSERT policy for audit_logs table to allow admins to create audit records
CREATE POLICY "Admins can create audit logs"
ON public.audit_logs
FOR INSERT
TO authenticated
WITH CHECK (has_role(auth.uid(), 'admin'));