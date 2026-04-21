
-- Volver a permitir lectura pública de payment_security_settings (no contiene secretos)
DROP POLICY IF EXISTS "Anyone can view payment security settings" ON public.payment_security_settings;
CREATE POLICY "Anyone can view payment security settings"
ON public.payment_security_settings FOR SELECT
USING (true);

-- Función que devuelve métodos con config DESPOJADA de campos sensibles
CREATE OR REPLACE FUNCTION public.get_public_payment_settings()
RETURNS TABLE(
  id uuid,
  method_key text,
  method_name text,
  is_enabled boolean,
  display_order integer,
  config jsonb
)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT 
    id, method_key, method_name, is_enabled, display_order,
    -- Quitar campos sensibles del config
    (config - 'clabe' - 'card_number' - 'cvv' - 'account_number' - 'bank_account' - 'api_key' - 'api_secret' - 'private_key') AS config
  FROM public.payment_settings
  ORDER BY display_order;
$$;
GRANT EXECUTE ON FUNCTION public.get_public_payment_settings() TO anon, authenticated;
