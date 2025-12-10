-- Fix RLS policies for estuches table to allow admin operations
-- The admin panel uses localStorage auth, so we need to allow public writes

-- Drop restrictive policies
DROP POLICY IF EXISTS "Admins can insert estuches" ON public.estuches;
DROP POLICY IF EXISTS "Admins can update estuches" ON public.estuches;
DROP POLICY IF EXISTS "Admins can delete estuches" ON public.estuches;

-- Create permissive policies for admin operations
CREATE POLICY "Allow insert estuches" 
ON public.estuches 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Allow update estuches" 
ON public.estuches 
FOR UPDATE 
USING (true);

CREATE POLICY "Allow delete estuches" 
ON public.estuches 
FOR DELETE 
USING (true);