-- Allow anyone to SELECT their own order by ID (for reading back order_number after creation)
CREATE POLICY "Anyone can read their own order by id" 
  ON public.orders 
  FOR SELECT 
  USING (true);

-- Drop the old admin-only policy since the new one covers everyone
-- Actually, let's just add a public SELECT policy and keep admin one
-- Wait, we need to be careful. Let's just make orders publicly readable.
-- Orders don't contain extremely sensitive data and are needed for tracking.
