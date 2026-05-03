-- Trigger to prevent tampering with immutable purchase fields
CREATE OR REPLACE FUNCTION public.prevent_purchase_field_tampering()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.user_id IS DISTINCT FROM OLD.user_id
    OR NEW.product_sku IS DISTINCT FROM OLD.product_sku
    OR NEW.amount_paid IS DISTINCT FROM OLD.amount_paid
    OR NEW.stripe_payment_intent_id IS DISTINCT FROM OLD.stripe_payment_intent_id
    OR NEW.download_token IS DISTINCT FROM OLD.download_token
  THEN
    RAISE EXCEPTION 'Cannot modify immutable purchase fields (user_id, product_sku, amount_paid, stripe_payment_intent_id, download_token)';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS purchases_prevent_tampering ON public.purchases;
CREATE TRIGGER purchases_prevent_tampering
BEFORE UPDATE ON public.purchases
FOR EACH ROW
EXECUTE FUNCTION public.prevent_purchase_field_tampering();

-- Restrictive policy: only admins can insert into audit_logs (defense in depth)
CREATE POLICY "Restrict audit_logs insert to admins only"
ON public.audit_logs
AS RESTRICTIVE
FOR INSERT
TO authenticated
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));