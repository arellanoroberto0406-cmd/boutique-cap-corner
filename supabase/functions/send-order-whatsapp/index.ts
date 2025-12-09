import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface OrderItem {
  name: string;
  quantity: number;
  price: number;
  color?: string | null;
}

interface OrderNotification {
  orderId: string;
  speiReference?: string | null;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  customerCity: string;
  customerState?: string;
  customerAddress: string;
  customerZip: string;
  customerNotes?: string | null;
  total: number;
  subtotal: number;
  shippingCost: number;
  paymentMethod: string;
  items: OrderItem[];
}

const paymentMethodLabels: Record<string, string> = {
  transfer: '💳 Transferencia SPEI',
  oxxo: '🏪 Depósito OXXO',
  kiosko: '🏧 Pago en Kiosko',
  stripe: '💳 Tarjeta de crédito',
};

const paymentInstructions: Record<string, string> = {
  transfer: `
📌 *DATOS PARA TRANSFERENCIA SPEI*
Banco: KLAR
Titular: GABRIEL ARELLANO
CLABE: 661610006945761800

Usa tu referencia SPEI como concepto de pago.`,
  oxxo: `
📌 *PAGO EN OXXO*
Acude a cualquier OXXO y realiza el depósito.
Te enviaremos los datos por mensaje.`,
  kiosko: `
📌 *PAGO EN KIOSKO*
Realiza tu pago en Kiosko con los datos que te proporcionaremos.`,
  stripe: `
📌 Tu pago con tarjeta ha sido procesado correctamente.`,
};

async function sendWhatsAppNotification(phone: string, apiKey: string, message: string): Promise<boolean> {
  try {
    const encodedMessage = encodeURIComponent(message);
    const url = `https://api.callmebot.com/whatsapp.php?phone=${phone}&text=${encodedMessage}&apikey=${apiKey}`;
    
    console.log(`Sending WhatsApp to ${phone}`);
    
    const response = await fetch(url);
    const text = await response.text();
    
    console.log(`CallMeBot response for ${phone}: ${text}`);
    
    return response.ok || text.includes('Message queued');
  } catch (error) {
    console.error(`Error sending WhatsApp to ${phone}:`, error);
    return false;
  }
}

// Send via WhatsApp Web link (for customer - opens WhatsApp with pre-filled message)
async function sendCustomerWhatsApp(phone: string, message: string): Promise<boolean> {
  // For customer notifications, we use a different approach
  // CallMeBot requires the recipient to register first, so we can't send directly
  // Instead, we'll send via the admin's WhatsApp to the customer
  // This is handled by notifying admin to contact customer
  console.log(`Customer notification prepared for ${phone}`);
  return true;
}

function formatItems(items: OrderItem[]): string {
  return items.map(item => {
    let line = `• ${item.quantity}x ${item.name} - $${(item.price * item.quantity).toFixed(2)}`;
    if (item.color) {
      line += ` (${item.color})`;
    }
    return line;
  }).join('\n');
}

function formatItemsSimple(items: OrderItem[]): string {
  return items.map(item => {
    let line = `• ${item.quantity}x ${item.name}`;
    if (item.color) {
      line += ` (${item.color})`;
    }
    return line;
  }).join('\n');
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const requestData = await req.json();
    console.log('Received notification request:', requestData);

    // Get API keys from environment
    const apiKey1 = Deno.env.get('WHATSAPP_API_KEY_1');
    const apiKey2 = Deno.env.get('WHATSAPP_API_KEY_2');

    if (!apiKey1 && !apiKey2) {
      console.log('No WhatsApp API keys configured');
      return new Response(
        JSON.stringify({ success: false, message: 'WhatsApp API keys not configured' }),
        { status: 200, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );
    }

    // Handle receipt upload notification
    if (requestData.type === 'receipt_uploaded') {
      const receiptMessage = `📎 *COMPROBANTE RECIBIDO*

📦 Pedido: *#${requestData.orderId.slice(0, 8).toUpperCase()}*${requestData.speiReference ? `\n🔖 Ref SPEI: ${requestData.speiReference}` : ''}
💰 Monto: *$${requestData.total.toFixed(2)} MXN*

🖼️ *Ver comprobante:*
${requestData.receiptUrl}

✅ Revisa y confirma el pago.`;

      const results: { phone: string; success: boolean; type: string }[] = [];

      if (apiKey1) {
        const success1 = await sendWhatsAppNotification('5213251120730', apiKey1, receiptMessage);
        results.push({ phone: '5213251120730', success: success1, type: 'receipt_admin' });
      }

      if (apiKey2) {
        await new Promise(resolve => setTimeout(resolve, 2000));
        const success2 = await sendWhatsAppNotification('5216692646083', apiKey2, receiptMessage);
        results.push({ phone: '5216692646083', success: success2, type: 'receipt_admin' });
      }

      console.log('Receipt notification results:', results);

      return new Response(
        JSON.stringify({ success: results.some(r => r.success), results, message: 'Receipt notification sent' }),
        { status: 200, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );
    }

    // Handle regular order notification
    const orderData = requestData as OrderNotification;

    // Format date in Mexico City timezone
    const now = new Date();
    const dateStr = now.toLocaleString('es-MX', { 
      timeZone: 'America/Mexico_City',
      weekday: 'short',
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    });

    // Build location string
    const location = [orderData.customerCity, orderData.customerState].filter(Boolean).join(', ');

    // ==========================================
    // ADMIN NOTIFICATION MESSAGE
    // ==========================================
    let adminMessage = `🛒 *NUEVO PEDIDO*

📦 *#${orderData.orderId.slice(0, 8).toUpperCase()}*${orderData.speiReference ? `\n🔖 Ref SPEI: ${orderData.speiReference}` : ''}
⏰ ${dateStr}

👤 *CLIENTE*
${orderData.customerName}
📱 ${orderData.customerPhone}
📧 ${orderData.customerEmail}

📍 *ENVÍO*
${orderData.customerAddress}
${location} CP ${orderData.customerZip}

🛍️ *PRODUCTOS*
${formatItems(orderData.items)}

💰 *TOTALES*
Subtotal: $${orderData.subtotal.toFixed(2)}
Envío: ${orderData.shippingCost === 0 ? 'GRATIS 🎉' : `$${orderData.shippingCost.toFixed(2)}`}
*TOTAL: $${orderData.total.toFixed(2)} MXN*

${paymentMethodLabels[orderData.paymentMethod] || orderData.paymentMethod}`;

    if (orderData.customerNotes) {
      adminMessage += `\n\n📝 *NOTAS*\n${orderData.customerNotes}`;
    }

    // ==========================================
    // CUSTOMER CONFIRMATION MESSAGE
    // ==========================================
    const customerMessage = `¡Hola ${orderData.customerName.split(' ')[0]}! 👋

✅ *Tu pedido ha sido recibido*

📦 Pedido: *#${orderData.orderId.slice(0, 8).toUpperCase()}*${orderData.speiReference ? `\n🔖 Referencia: *${orderData.speiReference}*` : ''}

🛍️ *Tus productos:*
${formatItemsSimple(orderData.items)}

💰 *Total a pagar: $${orderData.total.toFixed(2)} MXN*
${paymentInstructions[orderData.paymentMethod] || ''}

📍 Envío a: ${orderData.customerCity}${orderData.customerState ? `, ${orderData.customerState}` : ''}

⏳ Una vez confirmado tu pago, prepararemos tu pedido.

¿Tienes dudas? Responde a este mensaje 📩

*Gracias por tu compra!* 🎉
- Equipo Caps`;

    const results: { phone: string; success: boolean; type: string }[] = [];

    // Send admin notifications
    if (apiKey1) {
      const success1 = await sendWhatsAppNotification('5213251120730', apiKey1, adminMessage);
      results.push({ phone: '5213251120730', success: success1, type: 'admin' });
    }

    if (apiKey2) {
      const success2 = await sendWhatsAppNotification('5216692646083', apiKey2, adminMessage);
      results.push({ phone: '5216692646083', success: success2, type: 'admin' });
    }

    // Send customer confirmation via admin's WhatsApp
    // We'll include a message for the admin to forward or the customer contact info
    const customerPhone = orderData.customerPhone.replace(/\D/g, '');
    const formattedCustomerPhone = customerPhone.startsWith('52') ? customerPhone : `52${customerPhone}`;
    
    // Send a follow-up message to admin with customer message to forward
    const forwardMessage = `📤 *MENSAJE PARA CLIENTE*
Número: wa.me/${formattedCustomerPhone}

👇 Copia y envía al cliente:

${customerMessage}`;

    // Send forward instruction to first admin
    if (apiKey1) {
      // Small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 2000));
      const forwardSuccess = await sendWhatsAppNotification('5213251120730', apiKey1, forwardMessage);
      results.push({ phone: '5213251120730', success: forwardSuccess, type: 'customer_forward' });
    }

    console.log('WhatsApp notification results:', results);

    return new Response(
      JSON.stringify({ 
        success: results.some(r => r.success), 
        results,
        customerPhone: formattedCustomerPhone,
        message: 'Notifications processed'
      }),
      { status: 200, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
    );

  } catch (error: any) {
    console.error('Error in send-order-whatsapp:', error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
    );
  }
};

serve(handler);
