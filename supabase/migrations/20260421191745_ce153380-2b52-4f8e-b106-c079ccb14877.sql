
-- ============ BRANDS ============
DROP POLICY IF EXISTS "Allow delete brands" ON public.brands;
DROP POLICY IF EXISTS "Allow insert brands" ON public.brands;
DROP POLICY IF EXISTS "Allow update brands" ON public.brands;

CREATE POLICY "Admins can insert brands"
ON public.brands FOR INSERT TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update brands"
ON public.brands FOR UPDATE TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete brands"
ON public.brands FOR DELETE TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- ============ BRAND_PRODUCTS ============
DROP POLICY IF EXISTS "Allow delete brand_products" ON public.brand_products;
DROP POLICY IF EXISTS "Allow insert brand_products" ON public.brand_products;
DROP POLICY IF EXISTS "Allow update brand_products" ON public.brand_products;

CREATE POLICY "Admins can insert brand_products"
ON public.brand_products FOR INSERT TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update brand_products"
ON public.brand_products FOR UPDATE TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete brand_products"
ON public.brand_products FOR DELETE TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- ============ ESTUCHES ============
DROP POLICY IF EXISTS "Allow delete estuches" ON public.estuches;
DROP POLICY IF EXISTS "Allow insert estuches" ON public.estuches;
DROP POLICY IF EXISTS "Allow update estuches" ON public.estuches;

CREATE POLICY "Admins can insert estuches"
ON public.estuches FOR INSERT TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update estuches"
ON public.estuches FOR UPDATE TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete estuches"
ON public.estuches FOR DELETE TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- ============ AUTH_CODES ============
-- Eliminar políticas públicas; solo service role gestiona códigos 2FA desde edge function
DROP POLICY IF EXISTS "Authenticated users can insert auth codes" ON public.auth_codes;
DROP POLICY IF EXISTS "Users can update their own codes" ON public.auth_codes;
DROP POLICY IF EXISTS "Users can view their own codes" ON public.auth_codes;

CREATE POLICY "Service role manages auth codes"
ON public.auth_codes FOR ALL
USING (public.is_service_role())
WITH CHECK (public.is_service_role());

-- ============ ORDERS ============
-- Quitar lectura pública total; admins ven todo, el cliente recibe los datos vía respuesta directa de su INSERT
DROP POLICY IF EXISTS "Anyone can read their own order by id" ON public.orders;
