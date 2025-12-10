-- Fix discount_codes: Remove public read policy for active codes
-- Keep only the admin view and the validate function for code checking
DROP POLICY IF EXISTS "Anyone can view active discount codes" ON public.discount_codes;

-- Fix auth_codes: Only allow authenticated users to insert
DROP POLICY IF EXISTS "Users can insert auth codes" ON public.auth_codes;

CREATE POLICY "Authenticated users can insert auth codes" 
ON public.auth_codes 
FOR INSERT 
WITH CHECK (auth.uid() IS NOT NULL);

-- Fix orders: Remove duplicate insert policy
DROP POLICY IF EXISTS "orders_insert_policy" ON public.orders;