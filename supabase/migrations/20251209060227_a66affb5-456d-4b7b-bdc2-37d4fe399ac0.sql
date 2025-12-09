-- Fix discount_codes: Remove public read access and add admin-only read
DROP POLICY IF EXISTS "Anyone can read active discount codes" ON public.discount_codes;

-- Create policy for admins to read all discount codes
CREATE POLICY "Admins can read all discount codes"
ON public.discount_codes
FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

-- Create a function to validate discount codes without exposing data
CREATE OR REPLACE FUNCTION public.validate_discount_code(code_input TEXT)
RETURNS TABLE (
  is_valid BOOLEAN,
  discount_type TEXT,
  discount_value NUMERIC,
  min_purchase NUMERIC
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    true AS is_valid,
    dc.discount_type,
    dc.discount_value,
    COALESCE(dc.min_purchase, 0) AS min_purchase
  FROM public.discount_codes dc
  WHERE dc.code = UPPER(code_input)
    AND dc.is_active = true
    AND (dc.valid_from IS NULL OR dc.valid_from <= now())
    AND (dc.valid_until IS NULL OR dc.valid_until >= now())
    AND (dc.max_uses IS NULL OR dc.uses_count < dc.max_uses);
    
  -- If no rows returned, the code is invalid
  IF NOT FOUND THEN
    RETURN QUERY SELECT false, NULL::TEXT, NULL::NUMERIC, NULL::NUMERIC;
  END IF;
END;
$$;

-- Grant execute permission to anonymous and authenticated users
GRANT EXECUTE ON FUNCTION public.validate_discount_code(TEXT) TO anon;
GRANT EXECUTE ON FUNCTION public.validate_discount_code(TEXT) TO authenticated;