-- Add SPEI reference column to orders
ALTER TABLE public.orders ADD COLUMN spei_reference TEXT UNIQUE;

-- Create function to generate unique SPEI reference
CREATE OR REPLACE FUNCTION public.generate_spei_reference()
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_ref TEXT;
  ref_exists BOOLEAN;
BEGIN
  LOOP
    -- Generate reference: CAP + 6 random digits + last 2 digits of year
    new_ref := 'CAP' || LPAD(FLOOR(RANDOM() * 1000000)::TEXT, 6, '0') || TO_CHAR(NOW(), 'YY');
    
    -- Check if reference already exists
    SELECT EXISTS(SELECT 1 FROM orders WHERE spei_reference = new_ref) INTO ref_exists;
    
    EXIT WHEN NOT ref_exists;
  END LOOP;
  
  RETURN new_ref;
END;
$$;