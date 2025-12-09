import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const sendEmail = async (to: string, subject: string, html: string) => {
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${RESEND_API_KEY}`,
    },
    body: JSON.stringify({
      from: "Cap Store <onboarding@resend.dev>",
      to: [to],
      subject,
      html,
    }),
  });
  return response.json();
};

interface OrderItem {
  product_name: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  selected_color?: string;
}

interface EmailRequest {
  type: "order_created" | "payment_confirmed" | "order_shipped";
  to: string;
  customerName: string;
  orderId: string;
  speiReference?: string;
  items: OrderItem[];
  subtotal: number;
  shipping: number;
  discount?: number;
  total: number;
  trackingNumber?: string;
  shippingCity?: string;
  shippingState?: string;
  paymentMethod?: string;
}

const paymentMethodLabels: Record<string, string> = {
  transfer: "Transferencia Bancaria",
  oxxo: "Pago en OXXO",
  kiosko: "Pago en Kiosko",
  card: "Tarjeta de Crédito/Débito",
};

const bankInfo = {
  bank: "KLAR",
  accountName: "GABRIEL ARELLANO",
  clabe: "661610006945761800",
};

const formatPrice = (price: number) => `$${price.toFixed(2)} MXN`;

const formatItems = (items: OrderItem[]) => {
  return items.map(item => `
    <tr>
      <td style="padding: 12px; border-bottom: 1px solid #e5e5e5;">
        ${item.product_name}${item.selected_color ? ` (${item.selected_color})` : ''}
      </td>
      <td style="padding: 12px; border-bottom: 1px solid #e5e5e5; text-align: center;">${item.quantity}</td>
      <td style="padding: 12px; border-bottom: 1px solid #e5e5e5; text-align: right;">${formatPrice(item.total_price)}</td>
    </tr>
  `).join('');
};

const getOrderCreatedEmail = (data: EmailRequest) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
  <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff;">
    <!-- Header -->
    <div style="background-color: #f97316; padding: 30px; text-align: center;">
      <h1 style="color: #ffffff; margin: 0; font-size: 28px;">¡Pedido Confirmado!</h1>
    </div>
    
    <!-- Content -->
    <div style="padding: 30px;">
      <p style="font-size: 16px; color: #333;">Hola <strong>${data.customerName}</strong>,</p>
      <p style="font-size: 16px; color: #333;">¡Gracias por tu compra! Hemos recibido tu pedido y está siendo procesado.</p>
      
      <!-- Order Info -->
      <div style="background-color: #fff7ed; border: 1px solid #fed7aa; border-radius: 8px; padding: 20px; margin: 20px 0;">
        <p style="margin: 0 0 10px 0;"><strong>Número de pedido:</strong> ${data.orderId.slice(0, 8).toUpperCase()}</p>
        ${data.speiReference ? `<p style="margin: 0;"><strong>Referencia SPEI:</strong> <span style="font-family: monospace; font-size: 18px; color: #f97316;">${data.speiReference}</span></p>` : ''}
      </div>
      
      <!-- Items Table -->
      <h3 style="color: #333; border-bottom: 2px solid #f97316; padding-bottom: 10px;">Productos</h3>
      <table style="width: 100%; border-collapse: collapse;">
        <thead>
          <tr style="background-color: #f5f5f5;">
            <th style="padding: 12px; text-align: left;">Producto</th>
            <th style="padding: 12px; text-align: center;">Cant.</th>
            <th style="padding: 12px; text-align: right;">Precio</th>
          </tr>
        </thead>
        <tbody>
          ${formatItems(data.items)}
        </tbody>
      </table>
      
      <!-- Totals -->
      <div style="margin-top: 20px; padding: 20px; background-color: #f9fafb; border-radius: 8px;">
        <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
          <span>Subtotal:</span>
          <span>${formatPrice(data.subtotal)}</span>
        </div>
        ${data.discount && data.discount > 0 ? `
        <div style="display: flex; justify-content: space-between; margin-bottom: 8px; color: #16a34a;">
          <span>Descuento:</span>
          <span>-${formatPrice(data.discount)}</span>
        </div>
        ` : ''}
        <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
          <span>Envío:</span>
          <span>${data.shipping === 0 ? '<span style="color: #16a34a;">GRATIS</span>' : formatPrice(data.shipping)}</span>
        </div>
        <div style="display: flex; justify-content: space-between; font-size: 20px; font-weight: bold; border-top: 2px solid #e5e5e5; padding-top: 12px; margin-top: 12px;">
          <span>Total:</span>
          <span style="color: #f97316;">${formatPrice(data.total)}</span>
        </div>
      </div>
      
      <!-- Payment Instructions -->
      ${data.paymentMethod === 'transfer' ? `
      <div style="margin-top: 30px; padding: 20px; background-color: #fef3c7; border: 1px solid #f59e0b; border-radius: 8px;">
        <h3 style="margin-top: 0; color: #92400e;">📋 Datos para Transferencia</h3>
        <p><strong>Banco:</strong> ${bankInfo.bank}</p>
        <p><strong>Beneficiario:</strong> ${bankInfo.accountName}</p>
        <p><strong>CLABE:</strong> <span style="font-family: monospace;">${bankInfo.clabe}</span></p>
        <p style="margin-top: 15px; padding: 10px; background-color: #ffffff; border-radius: 4px;">
          <strong>IMPORTANTE:</strong> Incluye la referencia <strong style="color: #f97316;">${data.speiReference}</strong> en el concepto de tu transferencia.
        </p>
      </div>
      ` : ''}
      
      <p style="margin-top: 30px; color: #666; font-size: 14px;">
        Si tienes alguna pregunta, no dudes en contactarnos por WhatsApp al <a href="https://wa.me/5213313686950" style="color: #f97316;">+52 1 331 368 6950</a>
      </p>
    </div>
    
    <!-- Footer -->
    <div style="background-color: #1a1a1a; padding: 20px; text-align: center;">
      <p style="color: #888; margin: 0; font-size: 14px;">© 2024 Cap Store. Todos los derechos reservados.</p>
    </div>
  </div>
</body>
</html>
`;

const getPaymentConfirmedEmail = (data: EmailRequest) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
  <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff;">
    <!-- Header -->
    <div style="background-color: #16a34a; padding: 30px; text-align: center;">
      <h1 style="color: #ffffff; margin: 0; font-size: 28px;">✓ Pago Confirmado</h1>
    </div>
    
    <!-- Content -->
    <div style="padding: 30px;">
      <p style="font-size: 16px; color: #333;">Hola <strong>${data.customerName}</strong>,</p>
      <p style="font-size: 16px; color: #333;">¡Excelentes noticias! Hemos confirmado tu pago y tu pedido está siendo preparado para envío.</p>
      
      <!-- Order Info -->
      <div style="background-color: #dcfce7; border: 1px solid #86efac; border-radius: 8px; padding: 20px; margin: 20px 0; text-align: center;">
        <p style="font-size: 48px; margin: 0;">✅</p>
        <p style="margin: 10px 0 0 0; font-size: 18px;"><strong>Pedido #${data.orderId.slice(0, 8).toUpperCase()}</strong></p>
        ${data.speiReference ? `<p style="margin: 5px 0 0 0; color: #666;">Referencia: ${data.speiReference}</p>` : ''}
      </div>
      
      <!-- Items Summary -->
      <h3 style="color: #333;">Resumen de tu pedido</h3>
      <table style="width: 100%; border-collapse: collapse;">
        <tbody>
          ${formatItems(data.items)}
        </tbody>
      </table>
      
      <div style="margin-top: 20px; text-align: right; font-size: 18px;">
        <strong>Total pagado: <span style="color: #16a34a;">${formatPrice(data.total)}</span></strong>
      </div>
      
      <div style="margin-top: 30px; padding: 20px; background-color: #f0f9ff; border: 1px solid #bae6fd; border-radius: 8px;">
        <h4 style="margin-top: 0; color: #0369a1;">📦 ¿Qué sigue?</h4>
        <p style="margin: 0; color: #333;">Estamos preparando tu pedido. Recibirás otro correo con el número de guía cuando sea enviado.</p>
      </div>
      
      <p style="margin-top: 30px; color: #666; font-size: 14px;">
        ¿Tienes preguntas? Contáctanos por WhatsApp: <a href="https://wa.me/5213313686950" style="color: #16a34a;">+52 1 331 368 6950</a>
      </p>
    </div>
    
    <!-- Footer -->
    <div style="background-color: #1a1a1a; padding: 20px; text-align: center;">
      <p style="color: #888; margin: 0; font-size: 14px;">© 2024 Cap Store. Todos los derechos reservados.</p>
    </div>
  </div>
</body>
</html>
`;

const getOrderShippedEmail = (data: EmailRequest) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
  <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff;">
    <!-- Header -->
    <div style="background-color: #3b82f6; padding: 30px; text-align: center;">
      <h1 style="color: #ffffff; margin: 0; font-size: 28px;">🚚 ¡Tu pedido va en camino!</h1>
    </div>
    
    <!-- Content -->
    <div style="padding: 30px;">
      <p style="font-size: 16px; color: #333;">Hola <strong>${data.customerName}</strong>,</p>
      <p style="font-size: 16px; color: #333;">¡Tu pedido ha sido enviado! Pronto estará en tus manos.</p>
      
      <!-- Tracking Info -->
      <div style="background-color: #eff6ff; border: 1px solid #93c5fd; border-radius: 8px; padding: 20px; margin: 20px 0; text-align: center;">
        <p style="font-size: 48px; margin: 0;">📦</p>
        <p style="margin: 10px 0 0 0;"><strong>Número de Guía:</strong></p>
        <p style="margin: 5px 0; font-family: monospace; font-size: 24px; color: #3b82f6; letter-spacing: 2px;">${data.trackingNumber || 'Pendiente'}</p>
        ${data.shippingCity ? `<p style="margin: 10px 0 0 0; color: #666;">Destino: ${data.shippingCity}${data.shippingState ? `, ${data.shippingState}` : ''}</p>` : ''}
      </div>
      
      <!-- Order Summary -->
      <div style="background-color: #f9fafb; border-radius: 8px; padding: 20px; margin: 20px 0;">
        <h4 style="margin-top: 0;">Pedido #${data.orderId.slice(0, 8).toUpperCase()}</h4>
        ${data.items.map(item => `
          <p style="margin: 5px 0; color: #666;">• ${item.product_name} x${item.quantity}</p>
        `).join('')}
      </div>
      
      <div style="margin-top: 30px; padding: 20px; background-color: #fef3c7; border: 1px solid #fcd34d; border-radius: 8px;">
        <h4 style="margin-top: 0; color: #92400e;">📍 Seguimiento</h4>
        <p style="margin: 0; color: #333;">Puedes rastrear tu pedido en nuestra página usando tu referencia o número de guía.</p>
      </div>
      
      <p style="margin-top: 30px; color: #666; font-size: 14px;">
        ¿Tienes preguntas sobre tu envío? Contáctanos por WhatsApp: <a href="https://wa.me/5213313686950" style="color: #3b82f6;">+52 1 331 368 6950</a>
      </p>
    </div>
    
    <!-- Footer -->
    <div style="background-color: #1a1a1a; padding: 20px; text-align: center;">
      <p style="color: #888; margin: 0; font-size: 14px;">© 2024 Cap Store. Todos los derechos reservados.</p>
    </div>
  </div>
</body>
</html>
`;

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const data: EmailRequest = await req.json();
    
    console.log(`Sending ${data.type} email to ${data.to}`);
    
    if (!data.to || !data.customerName || !data.orderId) {
      throw new Error("Missing required fields: to, customerName, orderId");
    }

    let subject: string;
    let html: string;

    switch (data.type) {
      case "order_created":
        subject = `¡Pedido Confirmado! #${data.orderId.slice(0, 8).toUpperCase()}`;
        html = getOrderCreatedEmail(data);
        break;
      case "payment_confirmed":
        subject = `✓ Pago Confirmado - Pedido #${data.orderId.slice(0, 8).toUpperCase()}`;
        html = getPaymentConfirmedEmail(data);
        break;
      case "order_shipped":
        subject = `🚚 Tu pedido va en camino - #${data.orderId.slice(0, 8).toUpperCase()}`;
        html = getOrderShippedEmail(data);
        break;
      default:
        throw new Error(`Unknown email type: ${data.type}`);
    }

    const emailResponse = await sendEmail(data.to, subject, html);

    console.log("Email sent successfully:", emailResponse);

    return new Response(JSON.stringify({ success: true, data: emailResponse }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    console.error("Error in send-order-email function:", error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
