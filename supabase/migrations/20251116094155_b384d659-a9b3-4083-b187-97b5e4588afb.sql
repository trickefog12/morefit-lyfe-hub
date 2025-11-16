-- Create storage bucket for product files
INSERT INTO storage.buckets (id, name, public)
VALUES ('product-files', 'product-files', false);

-- RLS policies for product-files bucket
CREATE POLICY "Users can download their purchased files"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'product-files' 
  AND EXISTS (
    SELECT 1 FROM purchases
    WHERE purchases.download_token = (storage.foldername(name))[1]
    AND purchases.user_id = auth.uid()
    AND purchases.status = 'completed'
  )
);

-- Service role can upload files
CREATE POLICY "Service role can upload product files"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'product-files');

-- Service role can update files
CREATE POLICY "Service role can update product files"
ON storage.objects FOR UPDATE
USING (bucket_id = 'product-files');

-- Service role can delete files
CREATE POLICY "Service role can delete product files"
ON storage.objects FOR DELETE
USING (bucket_id = 'product-files');