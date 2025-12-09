-- Make policies completely open for all tables (temporary fix)
-- Drop all existing restrictive policies and create fully open ones

-- Brands
DROP POLICY IF EXISTS "Authenticated users can insert brands" ON public.brands;
DROP POLICY IF EXISTS "Authenticated users can update brands" ON public.brands;
DROP POLICY IF EXISTS "Authenticated users can delete brands" ON public.brands;

CREATE POLICY "Anyone can insert brands"
ON public.brands FOR INSERT
WITH CHECK (true);

CREATE POLICY "Anyone can update brands"
ON public.brands FOR UPDATE
USING (true);

CREATE POLICY "Anyone can delete brands"
ON public.brands FOR DELETE
USING (true);

-- Brand Products
DROP POLICY IF EXISTS "Authenticated users can insert brand_products" ON public.brand_products;
DROP POLICY IF EXISTS "Authenticated users can update brand_products" ON public.brand_products;
DROP POLICY IF EXISTS "Authenticated users can delete brand_products" ON public.brand_products;

CREATE POLICY "Anyone can insert brand_products"
ON public.brand_products FOR INSERT
WITH CHECK (true);

CREATE POLICY "Anyone can update brand_products"
ON public.brand_products FOR UPDATE
USING (true);

CREATE POLICY "Anyone can delete brand_products"
ON public.brand_products FOR DELETE
USING (true);

-- Estuches
DROP POLICY IF EXISTS "Authenticated users can insert estuches" ON public.estuches;
DROP POLICY IF EXISTS "Authenticated users can update estuches" ON public.estuches;
DROP POLICY IF EXISTS "Authenticated users can delete estuches" ON public.estuches;

CREATE POLICY "Anyone can insert estuches"
ON public.estuches FOR INSERT
WITH CHECK (true);

CREATE POLICY "Anyone can update estuches"
ON public.estuches FOR UPDATE
USING (true);

CREATE POLICY "Anyone can delete estuches"
ON public.estuches FOR DELETE
USING (true);

-- Products
DROP POLICY IF EXISTS "Authenticated users can insert products" ON public.products;
DROP POLICY IF EXISTS "Authenticated users can update products" ON public.products;
DROP POLICY IF EXISTS "Authenticated users can delete products" ON public.products;

CREATE POLICY "Anyone can insert products"
ON public.products FOR INSERT
WITH CHECK (true);

CREATE POLICY "Anyone can update products"
ON public.products FOR UPDATE
USING (true);

CREATE POLICY "Anyone can delete products"
ON public.products FOR DELETE
USING (true);

-- Product Images
DROP POLICY IF EXISTS "Authenticated users can insert product_images" ON public.product_images;
DROP POLICY IF EXISTS "Authenticated users can update product_images" ON public.product_images;
DROP POLICY IF EXISTS "Authenticated users can delete product_images" ON public.product_images;

CREATE POLICY "Anyone can insert product_images"
ON public.product_images FOR INSERT
WITH CHECK (true);

CREATE POLICY "Anyone can update product_images"
ON public.product_images FOR UPDATE
USING (true);

CREATE POLICY "Anyone can delete product_images"
ON public.product_images FOR DELETE
USING (true);

-- Pines
DROP POLICY IF EXISTS "Authenticated users can insert pines" ON public.pines;
DROP POLICY IF EXISTS "Authenticated users can update pines" ON public.pines;
DROP POLICY IF EXISTS "Authenticated users can delete pines" ON public.pines;

CREATE POLICY "Anyone can insert pines"
ON public.pines FOR INSERT
WITH CHECK (true);

CREATE POLICY "Anyone can update pines"
ON public.pines FOR UPDATE
USING (true);

CREATE POLICY "Anyone can delete pines"
ON public.pines FOR DELETE
USING (true);

-- Site Settings
DROP POLICY IF EXISTS "Authenticated users can insert site_settings" ON public.site_settings;
DROP POLICY IF EXISTS "Authenticated users can update site_settings" ON public.site_settings;
DROP POLICY IF EXISTS "Authenticated users can delete site_settings" ON public.site_settings;

CREATE POLICY "Anyone can insert site_settings"
ON public.site_settings FOR INSERT
WITH CHECK (true);

CREATE POLICY "Anyone can update site_settings"
ON public.site_settings FOR UPDATE
USING (true);

CREATE POLICY "Anyone can delete site_settings"
ON public.site_settings FOR DELETE
USING (true);

-- Theme Presets
DROP POLICY IF EXISTS "Authenticated users can insert theme_presets" ON public.theme_presets;
DROP POLICY IF EXISTS "Authenticated users can update theme_presets" ON public.theme_presets;
DROP POLICY IF EXISTS "Authenticated users can delete theme_presets" ON public.theme_presets;

CREATE POLICY "Anyone can insert theme_presets"
ON public.theme_presets FOR INSERT
WITH CHECK (true);

CREATE POLICY "Anyone can update theme_presets"
ON public.theme_presets FOR UPDATE
USING (true);

CREATE POLICY "Anyone can delete theme_presets"
ON public.theme_presets FOR DELETE
USING (true);

-- Discount Codes
DROP POLICY IF EXISTS "Authenticated users can insert discount_codes" ON public.discount_codes;
DROP POLICY IF EXISTS "Authenticated users can update discount_codes" ON public.discount_codes;
DROP POLICY IF EXISTS "Authenticated users can delete discount_codes" ON public.discount_codes;
DROP POLICY IF EXISTS "Authenticated users can read discount_codes" ON public.discount_codes;

CREATE POLICY "Anyone can read discount_codes"
ON public.discount_codes FOR SELECT
USING (true);

CREATE POLICY "Anyone can insert discount_codes"
ON public.discount_codes FOR INSERT
WITH CHECK (true);

CREATE POLICY "Anyone can update discount_codes"
ON public.discount_codes FOR UPDATE
USING (true);

CREATE POLICY "Anyone can delete discount_codes"
ON public.discount_codes FOR DELETE
USING (true);