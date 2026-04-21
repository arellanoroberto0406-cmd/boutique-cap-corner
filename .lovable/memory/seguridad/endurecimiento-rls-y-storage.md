---
name: Endurecimiento RLS, Storage y RPC públicas
description: Marcas/productos/estuches solo admin. payment_settings.config sanitizado vía RPC. Bucket payment-receipts privado. Tracking de pedido requiere teléfono. Receipt vía RPC <24h. HIBP activo.
type: feature
---

## Reglas de seguridad clave (NO violar)

- `brands`, `brand_products`, `estuches`: INSERT/UPDATE/DELETE solo `has_role(auth.uid(),'admin')`. SELECT público.
- `payment_settings`: SELECT público bloqueado. Frontend público debe usar RPC `get_public_payment_settings()` (omite clabe, card_number, cvv, account_number, bank_account, api_key, api_secret, private_key).
  - Hook `usePaymentSettings({ admin: true })` para panel admin (config completa).
  - Hook `usePaymentSettings()` por defecto para Checkout (config sanitizada).
- `auth_codes`: solo `is_service_role()`. Las edge functions usan SERVICE_ROLE_KEY.
- `orders`: SELECT solo admin. Lectura pública controlada vía:
  - `get_recent_order(uuid)` — ventana de 10 min tras creación (Checkout post-insert).
  - `get_order_tracking(reference, phone)` — TrackOrder requiere teléfono que coincida con el del pedido.
  - `attach_receipt(order_id, url)` — solo si pedido <24h y sin receipt previo.
- Storage `payment-receipts`: bucket privado. Cualquiera puede INSERT (subir). Solo admin SELECT/DELETE.
- Storage `brand-logos` y `product-images`: bucket público (lectura). Solo admin INSERT/UPDATE/DELETE.
- Auth: signups deshabilitados, anon users off, HIBP password protection on.
- Realtime publication incluye `orders` pero RLS impide que no-admins reciban eventos.

## Findings ignorados (intencionales)
Extension in public (Supabase managed), `Anyone can create orders/order_items` (checkout anónimo), `Public can upload payment receipts` (subida sin cuenta), buckets brand-logos/product-images públicos (assets visibles).
