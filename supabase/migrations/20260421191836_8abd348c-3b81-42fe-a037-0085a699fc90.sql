
-- 1) Tracking público que exige teléfono
CREATE OR REPLACE FUNCTION public.get_order_tracking(_reference text, _phone text)
RETURNS TABLE(
  id uuid,
  spei_reference text,
  customer_name text,
  payment_status text,
  order_status text,
  total numeric,
  shipping_city text,
  shipping_state text,
  tracking_number text,
  created_at timestamptz,
  updated_at timestamptz,
  order_number integer
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT o.id, o.spei_reference, o.customer_name, o.payment_status, o.order_status,
         o.total, o.shipping_city, o.shipping_state, o.tracking_number,
         o.created_at, o.updated_at, o.order_number
  FROM public.orders o
  WHERE (o.spei_reference = _reference OR o.id::text = _reference)
    AND regexp_replace(o.customer_phone, '\D', '', 'g') = regexp_replace(_phone, '\D', '', 'g')
  LIMIT 1;
$$;

-- 2) Lectura de pedido recién creado (hasta 10 min)
CREATE OR REPLACE FUNCTION public.get_recent_order(_order_id uuid)
RETURNS TABLE(
  id uuid,
  spei_reference text,
  order_number integer
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT o.id, o.spei_reference, o.order_number
  FROM public.orders o
  WHERE o.id = _order_id
    AND o.created_at > now() - interval '10 minutes'
  LIMIT 1;
$$;

-- 3) Adjuntar comprobante (solo si <24h y sin receipt)
CREATE OR REPLACE FUNCTION public.attach_receipt(_order_id uuid, _receipt_url text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  rows_updated int;
BEGIN
  IF _receipt_url IS NULL OR length(_receipt_url) < 10 OR length(_receipt_url) > 1000 THEN
    RETURN false;
  END IF;

  UPDATE public.orders
  SET receipt_url = _receipt_url, updated_at = now()
  WHERE id = _order_id
    AND created_at > now() - interval '24 hours'
    AND receipt_url IS NULL;

  GET DIAGNOSTICS rows_updated = ROW_COUNT;
  RETURN rows_updated > 0;
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_order_tracking(text, text) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.get_recent_order(uuid) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.attach_receipt(uuid, text) TO anon, authenticated;
