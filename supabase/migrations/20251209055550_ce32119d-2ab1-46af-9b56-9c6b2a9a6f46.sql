-- Fix login_attempts: Remove overly permissive policy and create proper ones
DROP POLICY IF EXISTS "System can manage login attempts" ON public.login_attempts;

-- Only allow admins to read login attempts
CREATE POLICY "Admins can view login attempts"
ON public.login_attempts
FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

-- System operations will use service role which bypasses RLS

-- Fix auth_codes: Remove the permissive insert policy
DROP POLICY IF EXISTS "Anyone can insert codes" ON public.auth_codes;

-- Auth codes should be created via edge functions using service role

-- Fix security_logs: Remove the permissive insert policy
DROP POLICY IF EXISTS "System can insert security logs" ON public.security_logs;

-- Security logs should be created via edge functions using service role