
-- PAYMENT_SETTINGS
DROP POLICY IF EXISTS "Anyone can view enabled payment settings" ON public.payment_settings;
DROP POLICY IF EXISTS "Admins can view payment settings" ON public.payment_settings;
CREATE POLICY "Admins can view payment settings"
ON public.payment_settings FOR SELECT TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE OR REPLACE FUNCTION public.get_public_payment_methods()
RETURNS TABLE(id uuid, method_key text, method_name text, is_enabled boolean, display_order integer)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT id, method_key, method_name, is_enabled, display_order
  FROM public.payment_settings WHERE is_enabled = true ORDER BY display_order;
$$;
GRANT EXECUTE ON FUNCTION public.get_public_payment_methods() TO anon, authenticated;

-- PAYMENT_SECURITY_SETTINGS
DROP POLICY IF EXISTS "Anyone can view payment security settings" ON public.payment_security_settings;
DROP POLICY IF EXISTS "Admins can view payment security settings" ON public.payment_security_settings;
CREATE POLICY "Admins can view payment security settings"
ON public.payment_security_settings FOR SELECT TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- STORAGE payment-receipts privado
UPDATE storage.buckets SET public = false WHERE id = 'payment-receipts';
DROP POLICY IF EXISTS "Anyone can view payment receipts" ON storage.objects;
DROP POLICY IF EXISTS "Public read payment-receipts" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can upload receipts" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can upload payment receipts" ON storage.objects;
DROP POLICY IF EXISTS "Public upload payment-receipts" ON storage.objects;
DROP POLICY IF EXISTS "Public can upload payment receipts" ON storage.objects;
DROP POLICY IF EXISTS "Admins can read payment receipts" ON storage.objects;
DROP POLICY IF EXISTS "Admins can manage payment receipts" ON storage.objects;

CREATE POLICY "Public can upload payment receipts"
ON storage.objects FOR INSERT TO anon, authenticated
WITH CHECK (bucket_id = 'payment-receipts');
CREATE POLICY "Admins can read payment receipts"
ON storage.objects FOR SELECT TO authenticated
USING (bucket_id = 'payment-receipts' AND public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can manage payment receipts"
ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'payment-receipts' AND public.has_role(auth.uid(), 'admin'));

-- STORAGE brand-logos
DROP POLICY IF EXISTS "Anyone can upload brand logos" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can update brand logos" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can delete brand logos" ON storage.objects;
DROP POLICY IF EXISTS "Public upload brand-logos" ON storage.objects;
DROP POLICY IF EXISTS "Public update brand-logos" ON storage.objects;
DROP POLICY IF EXISTS "Public delete brand-logos" ON storage.objects;
DROP POLICY IF EXISTS "Admins can upload brand logos" ON storage.objects;
DROP POLICY IF EXISTS "Admins can update brand logos" ON storage.objects;
DROP POLICY IF EXISTS "Admins can delete brand logos" ON storage.objects;

CREATE POLICY "Admins can upload brand logos"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'brand-logos' AND public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update brand logos"
ON storage.objects FOR UPDATE TO authenticated
USING (bucket_id = 'brand-logos' AND public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete brand logos"
ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'brand-logos' AND public.has_role(auth.uid(), 'admin'));

-- STORAGE product-images
DROP POLICY IF EXISTS "Anyone can upload product images" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can update product images" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can delete product images" ON storage.objects;
DROP POLICY IF EXISTS "Public upload product-images" ON storage.objects;
DROP POLICY IF EXISTS "Public update product-images" ON storage.objects;
DROP POLICY IF EXISTS "Public delete product-images" ON storage.objects;
DROP POLICY IF EXISTS "Admins can upload product images" ON storage.objects;
DROP POLICY IF EXISTS "Admins can update product images" ON storage.objects;
DROP POLICY IF EXISTS "Admins can delete product images" ON storage.objects;
DROP POLICY IF EXISTS "Admins can delete from product-images" ON storage.objects;

CREATE POLICY "Admins can upload product images"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'product-images' AND public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update product images"
ON storage.objects FOR UPDATE TO authenticated
USING (bucket_id = 'product-images' AND public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete product images"
ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'product-images' AND public.has_role(auth.uid(), 'admin'));

-- REALTIME: quitar orders del broadcast público
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'orders'
  ) THEN
    EXECUTE 'ALTER PUBLICATION supabase_realtime DROP TABLE public.orders';
  END IF;
END $$;
