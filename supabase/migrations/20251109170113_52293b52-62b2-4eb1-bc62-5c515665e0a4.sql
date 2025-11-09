-- Create purchases table for storing user orders
CREATE TABLE public.purchases (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  product_sku text NOT NULL,
  amount_paid numeric NOT NULL CHECK (amount_paid >= 0),
  stripe_payment_intent_id text UNIQUE,
  status text NOT NULL DEFAULT 'pending',
  purchased_at timestamptz NOT NULL DEFAULT now(),
  download_token text UNIQUE,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS on purchases
ALTER TABLE public.purchases ENABLE ROW LEVEL SECURITY;

-- Users can view only their own purchases
CREATE POLICY "Users can view own purchases"
  ON public.purchases
  FOR SELECT
  USING (auth.uid() = user_id);

-- Admins can view all purchases
CREATE POLICY "Admins can view all purchases"
  ON public.purchases
  FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

-- Service role can manage purchases (client inserts disabled for security)
CREATE POLICY "Service role can insert purchases"
  ON public.purchases
  FOR INSERT
  WITH CHECK (false);

-- Add index for common queries
CREATE INDEX idx_purchases_user_id ON public.purchases(user_id);
CREATE INDEX idx_purchases_stripe_payment_intent_id ON public.purchases(stripe_payment_intent_id);
CREATE INDEX idx_purchases_status ON public.purchases(status);

-- Create products table for server-side validation
CREATE TABLE public.products (
  sku text PRIMARY KEY,
  name_en text NOT NULL,
  name_el text NOT NULL,
  description_en text,
  description_el text,
  price numeric NOT NULL CHECK (price > 0),
  category text NOT NULL,
  format text NOT NULL,
  image_url text,
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS on products
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- Anyone can view active products
CREATE POLICY "Anyone can view active products"
  ON public.products
  FOR SELECT
  USING (active = true);

-- Only admins can manage products
CREATE POLICY "Admins can manage products"
  ON public.products
  FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

-- Add trigger for updated_at
CREATE TRIGGER update_products_updated_at
  BEFORE UPDATE ON public.products
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Seed products table with existing product data
INSERT INTO public.products (sku, name_en, name_el, price, category, format, active) VALUES
  ('MFL-PL1', 'MoreFitLyfe Method - Lite', 'Μέθοδος MoreFitLyfe - Lite', 40, 'program', 'digital', true),
  ('MFL-PL2', 'MoreFitLyfe Method - Standard', 'Μέθοδος MoreFitLyfe - Standard', 79, 'program', 'digital', true),
  ('MFL-PL3', 'MoreFitLyfe Method - Premium', 'Μέθοδος MoreFitLyfe - Premium', 124, 'program', 'digital', true),
  ('MFL-ST1', 'Strength Training Program - 3 Months', 'Πρόγραμμα Ενδυνάμωσης - 3 Μήνες', 84, 'program', 'digital', true),
  ('MFL-ST2', 'Strength Training Program - 6 Months', 'Πρόγραμμα Ενδυνάμωσης - 6 Μήνες', 149, 'program', 'digital', true),
  ('MFL-GD1', 'Complete Meal Planning Guide', 'Πλήρης Οδηγός Διατροφής', 29, 'guide', 'digital', true),
  ('MFL-CS1', '1-on-1 Coaching Session', 'Ατομική Συνεδρία Coaching', 99, 'session', 'service', true);

-- Add foreign key from purchases to products
ALTER TABLE public.purchases
  ADD CONSTRAINT fk_purchases_product_sku
  FOREIGN KEY (product_sku)
  REFERENCES public.products(sku);