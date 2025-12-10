-- 1. Fix orders table: Only admins can view orders
DROP POLICY IF EXISTS "Orders are viewable by everyone" ON public.orders;
DROP POLICY IF EXISTS "Anyone can insert orders" ON public.orders;
DROP POLICY IF EXISTS "Anyone can update orders" ON public.orders;

-- Allow anyone to insert orders (for checkout)
CREATE POLICY "Anyone can create orders" 
ON public.orders 
FOR INSERT 
WITH CHECK (true);

-- Only admins can view orders
CREATE POLICY "Admins can view all orders" 
ON public.orders 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_roles.user_id = auth.uid() 
    AND user_roles.role = 'admin'
  )
);

-- Only admins can update orders
CREATE POLICY "Admins can update orders" 
ON public.orders 
FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_roles.user_id = auth.uid() 
    AND user_roles.role = 'admin'
  )
);

-- 2. Fix auth_codes table: Add INSERT policy
DROP POLICY IF EXISTS "Users can insert their own auth codes" ON public.auth_codes;

CREATE POLICY "Users can insert auth codes" 
ON public.auth_codes 
FOR INSERT 
WITH CHECK (true);

-- 3. Fix discount_codes table: Only admins can manage
DROP POLICY IF EXISTS "Discount codes are viewable by everyone" ON public.discount_codes;
DROP POLICY IF EXISTS "Anyone can insert discount codes" ON public.discount_codes;
DROP POLICY IF EXISTS "Anyone can update discount codes" ON public.discount_codes;
DROP POLICY IF EXISTS "Anyone can delete discount codes" ON public.discount_codes;

-- Anyone can read active discount codes (needed for checkout validation)
CREATE POLICY "Anyone can view active discount codes" 
ON public.discount_codes 
FOR SELECT 
USING (is_active = true);

-- Admins can view all discount codes
CREATE POLICY "Admins can view all discount codes" 
ON public.discount_codes 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_roles.user_id = auth.uid() 
    AND user_roles.role = 'admin'
  )
);

-- Only admins can insert discount codes
CREATE POLICY "Admins can insert discount codes" 
ON public.discount_codes 
FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_roles.user_id = auth.uid() 
    AND user_roles.role = 'admin'
  )
);

-- Only admins can update discount codes
CREATE POLICY "Admins can update discount codes" 
ON public.discount_codes 
FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_roles.user_id = auth.uid() 
    AND user_roles.role = 'admin'
  )
);

-- Only admins can delete discount codes
CREATE POLICY "Admins can delete discount codes" 
ON public.discount_codes 
FOR DELETE 
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_roles.user_id = auth.uid() 
    AND user_roles.role = 'admin'
  )
);

-- 4. Fix products table: Only admins can modify
DROP POLICY IF EXISTS "Anyone can insert products" ON public.products;
DROP POLICY IF EXISTS "Anyone can update products" ON public.products;
DROP POLICY IF EXISTS "Anyone can delete products" ON public.products;

-- Only admins can insert products
CREATE POLICY "Admins can insert products" 
ON public.products 
FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_roles.user_id = auth.uid() 
    AND user_roles.role = 'admin'
  )
);

-- Only admins can update products
CREATE POLICY "Admins can update products" 
ON public.products 
FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_roles.user_id = auth.uid() 
    AND user_roles.role = 'admin'
  )
);

-- Only admins can delete products
CREATE POLICY "Admins can delete products" 
ON public.products 
FOR DELETE 
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_roles.user_id = auth.uid() 
    AND user_roles.role = 'admin'
  )
);