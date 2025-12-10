-- Drop existing restrictive policies on brands
DROP POLICY IF EXISTS "Anyone can view brands" ON public.brands;
DROP POLICY IF EXISTS "Anyone can insert brands" ON public.brands;
DROP POLICY IF EXISTS "Anyone can update brands" ON public.brands;
DROP POLICY IF EXISTS "Anyone can delete brands" ON public.brands;

-- Create permissive policies for brands
CREATE POLICY "Allow public read access to brands"
ON public.brands
FOR SELECT
TO public
USING (true);

CREATE POLICY "Allow authenticated users to insert brands"
ON public.brands
FOR INSERT
TO public
WITH CHECK (true);

CREATE POLICY "Allow authenticated users to update brands"
ON public.brands
FOR UPDATE
TO public
USING (true);

CREATE POLICY "Allow authenticated users to delete brands"
ON public.brands
FOR DELETE
TO public
USING (true);