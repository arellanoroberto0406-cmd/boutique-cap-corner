-- Drop existing restrictive policies
DROP POLICY IF EXISTS "Admins can insert pines" ON public.pines;
DROP POLICY IF EXISTS "Admins can update pines" ON public.pines;
DROP POLICY IF EXISTS "Admins can delete pines" ON public.pines;

-- Create new policies that allow authenticated users (since admin panel already requires auth)
CREATE POLICY "Authenticated users can insert pines"
ON public.pines
FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can update pines"
ON public.pines
FOR UPDATE
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can delete pines"
ON public.pines
FOR DELETE
USING (auth.uid() IS NOT NULL);