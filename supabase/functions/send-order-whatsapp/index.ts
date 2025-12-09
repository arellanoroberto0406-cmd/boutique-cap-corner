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

async function sendWhatsAppNotification(phone: string, apiKey: string, message: string): Promise<boolean> {
  try {
    const encodedMessage = encodeURIComponent(message);
    const url = `https://api.callmebot.com/whatsapp.php?phone=${phone}&text=${encodedMessage}&apikey=${apiKey}`;
    
    console.log(`Sending WhatsApp to ${phone}`);
    
    const response = await fetch(url);
    const text = await response.text();
    
    console.log(`CallMeBot response: ${text}`);
    
    return response.ok || text.includes('Message queued');
  } catch (error) {
    console.error(`Error sending WhatsApp to ${phone}:`, error);
    return false;
  }
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

const handler = async (req: Request): Promise<Response> => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const orderData: OrderNotification = await req.json();
    console.log('Received order notification request:', orderData);

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

    // Create detailed notification message
    let message = `🛒 *NUEVO PEDIDO*

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

    // Add notes if present
    if (orderData.customerNotes) {
      message += `\n\n📝 *NOTAS*\n${orderData.customerNotes}`;
    }

    const results: { phone: string; success: boolean }[] = [];

    // Send to first number (5213251120730 as registered with CallMeBot)
    if (apiKey1) {
      const success1 = await sendWhatsAppNotification('5213251120730', apiKey1, message);
      results.push({ phone: '5213251120730', success: success1 });
    }

    // Send to second number (5216692646083 as registered with CallMeBot)
    if (apiKey2) {
      const success2 = await sendWhatsAppNotification('5216692646083', apiKey2, message);
      results.push({ phone: '5216692646083', success: success2 });
    }

    console.log('WhatsApp notification results:', results);

    return new Response(
      JSON.stringify({ 
        success: results.some(r => r.success), 
        results,
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
