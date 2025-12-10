-- Fix site_settings policies - restrict to service role for write operations
-- Since admin panel uses localStorage auth (not Supabase Auth), we need a different approach

-- Drop the overly permissive policies we created earlier
DROP POLICY IF EXISTS "Anyone can insert site_settings" ON public.site_settings;
DROP POLICY IF EXISTS "Anyone can update site_settings" ON public.site_settings;

-- Create a function to check if the request comes from service role
CREATE OR REPLACE FUNCTION public.is_service_role()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT current_setting('request.jwt.claims', true)::json->>'role' = 'service_role'
$$;

-- Create policies that allow service role OR authenticated admins
CREATE POLICY "Service role can insert site_settings" 
ON public.site_settings 
FOR INSERT 
WITH CHECK (is_service_role() OR has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Service role can update site_settings" 
ON public.site_settings 
FOR UPDATE 
USING (is_service_role() OR has_role(auth.uid(), 'admin'::app_role));