-- Create purchase record for the test payment
-- Using the most recent live checkout session for MFL-MOB product
INSERT INTO public.purchases (
  user_id,
  product_sku,
  amount_paid,
  status,
  stripe_payment_intent_id,
  download_token,
  purchased_at
) VALUES (
  '754d164e-1872-4fc5-85b3-ac0d75b476a6',
  'MFL-MOB',
  15.00,
  'completed',
  'pi_manual_' || gen_random_uuid()::text,
  'manual-download-' || gen_random_uuid()::text,
  NOW()
);