-- Create table for security audit logs
CREATE TABLE public.security_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL,
  ip_address TEXT,
  action TEXT NOT NULL,
  success BOOLEAN NOT NULL DEFAULT false,
  details TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create table for rate limiting
CREATE TABLE public.login_attempts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL,
  ip_address TEXT,
  attempt_type TEXT NOT NULL, -- 'login', 'code_verify', 'code_request'
  failed_attempts INTEGER NOT NULL DEFAULT 0,
  blocked_until TIMESTAMP WITH TIME ZONE,
  last_attempt TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.security_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.login_attempts ENABLE ROW LEVEL SECURITY;

-- Only admins can view security logs
CREATE POLICY "Only admins can view security logs"
ON public.security_logs
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

-- Only system can insert logs
CREATE POLICY "System can insert security logs"
ON public.security_logs
FOR INSERT
WITH CHECK (true);

-- Only system can manage login attempts
CREATE POLICY "System can manage login attempts"
ON public.login_attempts
FOR ALL
USING (true)
WITH CHECK (true);

-- Create indexes for better performance
CREATE INDEX idx_security_logs_email ON public.security_logs(email);
CREATE INDEX idx_security_logs_created_at ON public.security_logs(created_at DESC);
CREATE INDEX idx_login_attempts_email ON public.login_attempts(email);
CREATE INDEX idx_login_attempts_blocked ON public.login_attempts(blocked_until);

-- Function to clean old logs (older than 90 days)
CREATE OR REPLACE FUNCTION public.cleanup_old_security_logs()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  DELETE FROM public.security_logs
  WHERE created_at < now() - INTERVAL '90 days';
  
  DELETE FROM public.login_attempts
  WHERE created_at < now() - INTERVAL '30 days'
    AND blocked_until IS NULL;
END;
$$;

-- Add constraint to auth_codes for attempts
ALTER TABLE public.auth_codes ADD COLUMN IF NOT EXISTS failed_attempts INTEGER NOT NULL DEFAULT 0;