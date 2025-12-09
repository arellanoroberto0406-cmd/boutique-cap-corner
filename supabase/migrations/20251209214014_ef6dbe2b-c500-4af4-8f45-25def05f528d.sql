-- Drop existing storage policies if any
DROP POLICY IF EXISTS "Anyone can upload product images" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can view product images" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can update product images" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can delete product images" ON storage.objects;

-- Create permissive policies for product-images bucket
CREATE POLICY "Anyone can upload product images"
ON storage.objects
FOR INSERT
WITH CHECK (bucket_id = 'product-images');

CREATE POLICY "Anyone can view product images"
ON storage.objects
FOR SELECT
USING (bucket_id = 'product-images');

CREATE POLICY "Anyone can update product images"
ON storage.objects
FOR UPDATE
USING (bucket_id = 'product-images');

CREATE POLICY "Anyone can delete product images"
ON storage.objects
FOR DELETE
USING (bucket_id = 'product-images');