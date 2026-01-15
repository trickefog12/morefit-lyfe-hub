-- Drop existing storage policies for product-files bucket
DROP POLICY IF EXISTS "Users can download purchased files" ON storage.objects;
DROP POLICY IF EXISTS "Admins can manage all files" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can download purchased files" ON storage.objects;

-- Create updated policy that matches the products/{sku}.pdf file structure
-- Users can download files for products they have purchased
CREATE POLICY "Users can download purchased files"
ON storage.objects
FOR SELECT
USING (
  bucket_id = 'product-files' AND
  auth.uid() IS NOT NULL AND
  EXISTS (
    SELECT 1 
    FROM public.purchases p
    WHERE p.user_id = auth.uid()
      AND p.status = 'completed'
      AND objects.name = 'products/' || p.product_sku || '.pdf'
  )
);

-- Admins can manage all files in the product-files bucket
CREATE POLICY "Admins can manage all files"
ON storage.objects
FOR ALL
USING (
  bucket_id = 'product-files' AND
  public.has_role(auth.uid(), 'admin')
)
WITH CHECK (
  bucket_id = 'product-files' AND
  public.has_role(auth.uid(), 'admin')
);