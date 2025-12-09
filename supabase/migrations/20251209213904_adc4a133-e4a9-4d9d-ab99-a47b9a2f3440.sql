-- Drop existing restrictive policies on estuches
DROP POLICY IF EXISTS "Anyone can delete estuches" ON public.estuches;
DROP POLICY IF EXISTS "Anyone can insert estuches" ON public.estuches;
DROP POLICY IF EXISTS "Anyone can update estuches" ON public.estuches;
DROP POLICY IF EXISTS "Anyone can view estuches" ON public.estuches;

-- Recreate as PERMISSIVE policies (default behavior)
CREATE POLICY "Anyone can view estuches" 
ON public.estuches 
FOR SELECT 
USING (true);

CREATE POLICY "Anyone can insert estuches" 
ON public.estuches 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Anyone can update estuches" 
ON public.estuches 
FOR UPDATE 
USING (true);

CREATE POLICY "Anyone can delete estuches" 
ON public.estuches 
FOR DELETE 
USING (true);