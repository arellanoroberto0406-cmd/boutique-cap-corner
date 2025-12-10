-- Allow public insert/update on site_settings for admin panel 
-- (admin authentication is handled at app level, not Supabase auth)
DROP POLICY IF EXISTS "Admins can insert site_settings" ON public.site_settings;
DROP POLICY IF EXISTS "Admins can update site_settings" ON public.site_settings;

-- Create permissive policies for insert/update
CREATE POLICY "Anyone can insert site_settings" 
ON public.site_settings 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Anyone can update site_settings" 
ON public.site_settings 
FOR UPDATE 
USING (true);