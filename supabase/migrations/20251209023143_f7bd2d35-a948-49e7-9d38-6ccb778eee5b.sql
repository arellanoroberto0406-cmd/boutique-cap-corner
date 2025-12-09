-- Create storage bucket for payment receipts
INSERT INTO storage.buckets (id, name, public)
VALUES ('payment-receipts', 'payment-receipts', true)
ON CONFLICT (id) DO NOTHING;

-- Allow anyone to upload payment receipts (since customers aren't authenticated)
CREATE POLICY "Anyone can upload payment receipts"
ON storage.objects
FOR INSERT
WITH CHECK (bucket_id = 'payment-receipts');

-- Allow anyone to view payment receipts
CREATE POLICY "Anyone can view payment receipts"
ON storage.objects
FOR SELECT
USING (bucket_id = 'payment-receipts');

-- Allow admins to delete payment receipts
CREATE POLICY "Admins can delete payment receipts"
ON storage.objects
FOR DELETE
USING (bucket_id = 'payment-receipts' AND has_role(auth.uid(), 'admin'::app_role));

-- Add receipt_url column to orders table
ALTER TABLE public.orders
ADD COLUMN IF NOT EXISTS receipt_url TEXT DEFAULT NULL;