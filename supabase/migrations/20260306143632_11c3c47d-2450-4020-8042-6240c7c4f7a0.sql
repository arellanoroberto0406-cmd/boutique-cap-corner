
CREATE TABLE public.payment_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  method_key text NOT NULL UNIQUE,
  method_name text NOT NULL,
  is_enabled boolean NOT NULL DEFAULT true,
  config jsonb NOT NULL DEFAULT '{}'::jsonb,
  display_order integer NOT NULL DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.payment_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view enabled payment settings"
  ON public.payment_settings FOR SELECT
  USING (true);

CREATE POLICY "Admins can insert payment settings"
  ON public.payment_settings FOR INSERT
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update payment settings"
  ON public.payment_settings FOR UPDATE
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete payment settings"
  ON public.payment_settings FOR DELETE
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Insert default payment methods with current hardcoded values
INSERT INTO public.payment_settings (method_key, method_name, is_enabled, config, display_order) VALUES
('transfer', 'Transferencia Bancaria (SPEI)', true, '{"bank": "KLAR", "account_name": "GABRIEL ARELLANO", "clabe": "661610006945761800", "description": "SPEI o transferencia tradicional"}'::jsonb, 1),
('oxxo', 'Pago en OXXO', true, '{"reference_code": "2242 1705 6014 0578", "description": "Paga en efectivo en cualquier OXXO", "qr_image": ""}'::jsonb, 2),
('kiosko', 'Otro Kiosco', true, '{"card_number": "5401040143621084", "clabe": "661610006945761800", "stores": ["7-Eleven", "Walmart", "Walmart Express", "Bodega Aurrera", "Kiosko", "Farmapronto", "X24", "Airpak", "Soriana"], "description": "7-Eleven, Farmacias y más"}'::jsonb, 3),
('paypal', 'PayPal', false, '{"email": "", "description": "Paga con tu cuenta de PayPal"}'::jsonb, 4),
('mercadopago', 'Mercado Pago', false, '{"link": "", "description": "Paga con Mercado Pago"}'::jsonb, 5);

-- Payment security settings table
CREATE TABLE public.payment_security_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  setting_key text NOT NULL UNIQUE,
  setting_value text NOT NULL DEFAULT '',
  is_enabled boolean NOT NULL DEFAULT false,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.payment_security_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view payment security settings"
  ON public.payment_security_settings FOR SELECT
  USING (true);

CREATE POLICY "Admins can insert payment security settings"
  ON public.payment_security_settings FOR INSERT
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update payment security settings"
  ON public.payment_security_settings FOR UPDATE
  USING (has_role(auth.uid(), 'admin'::app_role));

INSERT INTO public.payment_security_settings (setting_key, setting_value, is_enabled) VALUES
('require_receipt', 'true', true),
('payment_time_limit_hours', '48', true),
('min_order_amount', '100', false),
('max_order_amount', '50000', false),
('notify_whatsapp', 'true', true),
('notify_email', '', false),
('auto_cancel_unpaid', 'true', true);
