import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface OrderNotification {
  orderId: string;
  customerName: string;
  customerPhone: string;
  total: number;
  paymentMethod: string;
  itemsCount: number;
}

const paymentMethodLabels: Record<string, string> = {
  transfer: 'Transferencia SPEI',
  oxxo: 'Depósito OXXO',
  kiosko: 'Pago en Kiosko',
  stripe: 'Tarjeta de crédito',
};

async function sendWhatsAppNotification(phone: string, apiKey: string, message: string): Promise<boolean> {
  try {
    // Use the phone number exactly as registered with CallMeBot (no formatting needed)
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

const handler = async (req: Request): Promise<Response> => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const orderData: OrderNotification = await req.json();
    console.log('Received order notification request:', orderData);

    // Get API key for testing (only using number 2 for now)
    const apiKey2 = Deno.env.get('WHATSAPP_API_KEY_2');

    if (!apiKey2) {
      console.log('No WhatsApp API key configured');
      return new Response(
        JSON.stringify({ success: false, message: 'WhatsApp API key not configured' }),
        { status: 200, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );
    }

    // Create notification message
    const message = `🛒 *NUEVO PEDIDO*

📦 Pedido: #${orderData.orderId.slice(0, 8)}
👤 Cliente: ${orderData.customerName}
📱 Tel: ${orderData.customerPhone}
💰 Total: $${orderData.total.toFixed(2)} MXN
💳 Método: ${paymentMethodLabels[orderData.paymentMethod] || orderData.paymentMethod}
📦 Productos: ${orderData.itemsCount}

⏰ ${new Date().toLocaleString('es-MX', { timeZone: 'America/Mexico_City' })}`;

    const results: { phone: string; success: boolean }[] = [];

    // Send to 5216692646083 (as registered with CallMeBot)
    console.log('API Key 2 value:', apiKey2 ? `${apiKey2.substring(0, 3)}...` : 'empty');
    const success2 = await sendWhatsAppNotification('5216692646083', apiKey2, message);
    results.push({ phone: '5216692646083', success: success2 });
    results.push({ phone: '6692646083', success: success2 });

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
