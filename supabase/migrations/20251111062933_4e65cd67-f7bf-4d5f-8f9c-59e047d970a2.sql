-- Create table for 2FA codes
CREATE TABLE public.auth_codes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  code TEXT NOT NULL,
  email TEXT NOT NULL,
  verified BOOLEAN NOT NULL DEFAULT false,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.auth_codes ENABLE ROW LEVEL SECURITY;

-- Create policy for users to view their own codes
CREATE POLICY "Users can view their own codes"
ON public.auth_codes
FOR SELECT
USING (email = (SELECT email FROM auth.users WHERE id = auth.uid()));

-- Create policy for inserting codes (anyone can request a code)
CREATE POLICY "Anyone can insert codes"
ON public.auth_codes
FOR INSERT
WITH CHECK (true);

-- Create policy for updating codes (users can verify their own codes)
CREATE POLICY "Users can update their own codes"
ON public.auth_codes
FOR UPDATE
USING (email = (SELECT email FROM auth.users WHERE id = auth.uid()));

-- Create index for faster lookups
CREATE INDEX idx_auth_codes_email ON public.auth_codes(email);
CREATE INDEX idx_auth_codes_expires_at ON public.auth_codes(expires_at);

-- Create function to clean up expired codes
CREATE OR REPLACE FUNCTION public.cleanup_expired_codes()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  DELETE FROM public.auth_codes
  WHERE expires_at < now() OR verified = true;
END;
$$;