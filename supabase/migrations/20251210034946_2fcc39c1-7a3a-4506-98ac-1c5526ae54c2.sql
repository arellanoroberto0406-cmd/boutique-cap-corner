-- Create a secure function to increment coupon usage
CREATE OR REPLACE FUNCTION public.increment_discount_code_usage(code_input text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.discount_codes
  SET uses_count = uses_count + 1
  WHERE UPPER(code) = UPPER(code_input)
    AND is_active = true;
END;
$$;