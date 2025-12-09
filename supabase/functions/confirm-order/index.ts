import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const orderId = url.searchParams.get('order');
    const action = url.searchParams.get('action');
    const token = url.searchParams.get('token');

    console.log(`Confirm order request: order=${orderId}, action=${action}`);

    if (!orderId || !action) {
      return new Response(
        generateHTML('error', 'Parámetros inválidos', 'Faltan datos requeridos en el enlace.'),
        { status: 400, headers: { 'Content-Type': 'text/html; charset=utf-8', ...corsHeaders } }
      );
    }

    // Create Supabase client with service role
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Verify the order exists
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('*')
      .eq('id', orderId)
      .single();

    if (orderError || !order) {
      console.error('Order not found:', orderError);
      return new Response(
        generateHTML('error', 'Pedido no encontrado', `No se encontró el pedido #${orderId.slice(0, 8).toUpperCase()}`),
        { status: 404, headers: { 'Content-Type': 'text/html; charset=utf-8', ...corsHeaders } }
      );
    }

    // Handle different actions
    if (action === 'confirm_payment') {
      // Update payment status to confirmed
      const { error: updateError } = await supabase
        .from('orders')
        .update({ 
          payment_status: 'confirmed',
          updated_at: new Date().toISOString()
        })
        .eq('id', orderId);

      if (updateError) {
        console.error('Error updating order:', updateError);
        return new Response(
          generateHTML('error', 'Error al confirmar', 'No se pudo actualizar el estado del pago.'),
          { status: 500, headers: { 'Content-Type': 'text/html; charset=utf-8', ...corsHeaders } }
        );
      }

      // Add status history entry
      await supabase.from('order_status_history').insert({
        order_id: orderId,
        status_type: 'payment',
        old_status: order.payment_status,
        new_status: 'confirmed',
        changed_by: 'whatsapp_link',
        notes: 'Pago confirmado via enlace de WhatsApp'
      });

      // Send WhatsApp notification to customer about payment confirmation
      await sendPaymentConfirmationToCustomer(supabase, order);

      console.log(`Payment confirmed for order ${orderId}`);

      return new Response(
        generateHTML('success', '✅ Pago Confirmado', `
          <p>El pago del pedido <strong>#${orderId.slice(0, 8).toUpperCase()}</strong> ha sido confirmado.</p>
          <p><strong>Cliente:</strong> ${order.customer_name}</p>
          <p><strong>Total:</strong> $${order.total.toFixed(2)} MXN</p>
          <p class="notification">📱 Se ha enviado notificación al cliente.</p>
        `),
        { status: 200, headers: { 'Content-Type': 'text/html; charset=utf-8', ...corsHeaders } }
      );
    }

    // Handle cancel confirmation page
    if (action === 'cancel_confirm') {
      return new Response(
        generateHTML('warning', '⚠️ Cancelar Pedido', `
          <p>¿Estás seguro de que deseas cancelar el pedido <strong>#${orderId.slice(0, 8).toUpperCase()}</strong>?</p>
          <div class="order-summary">
            <p><strong>Cliente:</strong> ${order.customer_name}</p>
            <p><strong>Total:</strong> $${order.total.toFixed(2)} MXN</p>
            <p><strong>Estado actual:</strong> ${order.order_status}</p>
          </div>
          <p class="warning-text">⚠️ Esta acción no se puede deshacer.</p>
          <div class="actions">
            <a href="?order=${orderId}&action=cancel_execute" class="btn btn-danger">❌ Sí, Cancelar Pedido</a>
            <a href="?order=${orderId}&action=view" class="btn btn-secondary">← Volver</a>
          </div>
        `),
        { status: 200, headers: { 'Content-Type': 'text/html; charset=utf-8', ...corsHeaders } }
      );
    }

    // Execute order cancellation
    if (action === 'cancel_execute') {
      if (order.order_status === 'cancelled') {
        return new Response(
          generateHTML('info', 'Pedido ya cancelado', `El pedido #${orderId.slice(0, 8).toUpperCase()} ya fue cancelado anteriormente.`),
          { status: 200, headers: { 'Content-Type': 'text/html; charset=utf-8', ...corsHeaders } }
        );
      }

      // Update order status to cancelled
      const { error: updateError } = await supabase
        .from('orders')
        .update({ 
          order_status: 'cancelled',
          payment_status: 'cancelled',
          updated_at: new Date().toISOString()
        })
        .eq('id', orderId);

      if (updateError) {
        console.error('Error cancelling order:', updateError);
        return new Response(
          generateHTML('error', 'Error al cancelar', 'No se pudo cancelar el pedido.'),
          { status: 500, headers: { 'Content-Type': 'text/html; charset=utf-8', ...corsHeaders } }
        );
      }

      // Add status history entry
      await supabase.from('order_status_history').insert({
        order_id: orderId,
        status_type: 'order',
        old_status: order.order_status,
        new_status: 'cancelled',
        changed_by: 'whatsapp_link',
        notes: 'Pedido cancelado via enlace de WhatsApp'
      });

      console.log(`Order ${orderId} cancelled`);

      return new Response(
        generateHTML('error', '❌ Pedido Cancelado', `
          <p>El pedido <strong>#${orderId.slice(0, 8).toUpperCase()}</strong> ha sido cancelado.</p>
          <p><strong>Cliente:</strong> ${order.customer_name}</p>
          <p><strong>Total:</strong> $${order.total.toFixed(2)} MXN</p>
          <p class="notification">El pedido ya no será procesado.</p>
        `),
        { status: 200, headers: { 'Content-Type': 'text/html; charset=utf-8', ...corsHeaders } }
      );
    }

    if (action === 'mark_shipped') {
      // Update order status to shipped
      const { error: updateError } = await supabase
        .from('orders')
        .update({ 
          order_status: 'shipped',
          updated_at: new Date().toISOString()
        })
        .eq('id', orderId);

      if (updateError) {
        console.error('Error updating order:', updateError);
        return new Response(
          generateHTML('error', 'Error al actualizar', 'No se pudo marcar el pedido como enviado.'),
          { status: 500, headers: { 'Content-Type': 'text/html; charset=utf-8', ...corsHeaders } }
        );
      }

      // Add status history entry
      await supabase.from('order_status_history').insert({
        order_id: orderId,
        status_type: 'order',
        old_status: order.order_status,
        new_status: 'shipped',
        changed_by: 'whatsapp_link',
        notes: 'Pedido enviado via enlace de WhatsApp'
      });

      console.log(`Order ${orderId} marked as shipped`);

      return new Response(
        generateHTML('success', '🚚 Pedido Enviado', `
          <p>El pedido <strong>#${orderId.slice(0, 8).toUpperCase()}</strong> ha sido marcado como enviado.</p>
          <p><strong>Cliente:</strong> ${order.customer_name}</p>
          <p><strong>Destino:</strong> ${order.shipping_city}, ${order.shipping_state || ''}</p>
        `),
        { status: 200, headers: { 'Content-Type': 'text/html; charset=utf-8', ...corsHeaders } }
      );
    }

    if (action === 'view') {
      // Just show order details
      const { data: items } = await supabase
        .from('order_items')
        .select('*')
        .eq('order_id', orderId);

      const itemsList = items?.map(item => 
        `<li>${item.quantity}x ${item.product_name}${item.selected_color ? ` (${item.selected_color})` : ''} - $${item.total_price.toFixed(2)}</li>`
      ).join('') || '';

      const statusBadge = order.payment_status === 'confirmed' 
        ? '<span class="badge confirmed">✅ Pago Confirmado</span>'
        : '<span class="badge pending">⏳ Pago Pendiente</span>';

      return new Response(
        generateHTML('info', `📦 Pedido #${orderId.slice(0, 8).toUpperCase()}`, `
          ${statusBadge}
          <div class="order-details">
            <p><strong>Cliente:</strong> ${order.customer_name}</p>
            <p><strong>Teléfono:</strong> ${order.customer_phone}</p>
            <p><strong>Email:</strong> ${order.customer_email || 'No proporcionado'}</p>
            <p><strong>Dirección:</strong> ${order.shipping_address}</p>
            <p><strong>Ciudad:</strong> ${order.shipping_city}, ${order.shipping_state || ''} CP ${order.shipping_zip}</p>
          </div>
          <h3>Productos:</h3>
          <ul class="items-list">${itemsList}</ul>
          <div class="totals">
            <p>Subtotal: $${order.subtotal.toFixed(2)}</p>
            <p>Envío: ${order.shipping_cost === 0 ? 'GRATIS' : `$${order.shipping_cost.toFixed(2)}`}</p>
            <p class="total"><strong>Total: $${order.total.toFixed(2)} MXN</strong></p>
          </div>
          ${order.payment_status !== 'confirmed' ? `
            <div class="actions">
              <a href="?order=${orderId}&action=confirm_payment" class="btn btn-success">✅ Confirmar Pago</a>
            </div>
          ` : ''}
        `),
        { status: 200, headers: { 'Content-Type': 'text/html; charset=utf-8', ...corsHeaders } }
      );
    }

    return new Response(
      generateHTML('error', 'Acción no válida', 'La acción solicitada no es válida.'),
      { status: 400, headers: { 'Content-Type': 'text/html; charset=utf-8', ...corsHeaders } }
    );

  } catch (error: any) {
    console.error('Error in confirm-order:', error);
    return new Response(
      generateHTML('error', 'Error del servidor', error.message),
      { status: 500, headers: { 'Content-Type': 'text/html; charset=utf-8', ...corsHeaders } }
    );
  }
};

async function sendPaymentConfirmationToCustomer(supabase: any, order: any) {
  try {
    // Get order items
    const { data: items } = await supabase
      .from('order_items')
      .select('*')
      .eq('order_id', order.id);

    // Call the WhatsApp function to send payment confirmation
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    
    await fetch(`${supabaseUrl}/functions/v1/send-order-whatsapp`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${supabaseAnonKey}`
      },
      body: JSON.stringify({
        type: 'payment_confirmed',
        orderId: order.id,
        customerName: order.customer_name,
        customerPhone: order.customer_phone,
        speiReference: order.spei_reference,
        total: order.total,
        items: items?.map((item: any) => ({
          name: item.product_name,
          quantity: item.quantity,
          price: item.unit_price,
          color: item.selected_color
        })) || []
      })
    });

    console.log('Payment confirmation sent to customer');
  } catch (error) {
    console.error('Error sending payment confirmation:', error);
  }
}

function generateHTML(type: 'success' | 'error' | 'info' | 'warning', title: string, content: string): string {
  const colors = {
    success: { bg: '#10B981', light: '#D1FAE5' },
    error: { bg: '#EF4444', light: '#FEE2E2' },
    info: { bg: '#3B82F6', light: '#DBEAFE' },
    warning: { bg: '#F59E0B', light: '#FEF3C7' }
  };

  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title} - Caps Store</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 20px;
    }
    .container {
      background: white;
      border-radius: 16px;
      box-shadow: 0 20px 60px rgba(0,0,0,0.3);
      max-width: 480px;
      width: 100%;
      overflow: hidden;
    }
    .header {
      background: ${colors[type].bg};
      color: white;
      padding: 24px;
      text-align: center;
    }
    .header h1 {
      font-size: 24px;
      margin: 0;
    }
    .content {
      padding: 24px;
    }
    .content p {
      margin-bottom: 12px;
      color: #374151;
      line-height: 1.5;
    }
    .notification {
      background: ${colors[type].light};
      padding: 12px;
      border-radius: 8px;
      margin-top: 16px;
      text-align: center;
      font-weight: 500;
    }
    .badge {
      display: inline-block;
      padding: 6px 12px;
      border-radius: 20px;
      font-size: 14px;
      font-weight: 600;
      margin-bottom: 16px;
    }
    .badge.confirmed { background: #D1FAE5; color: #059669; }
    .badge.pending { background: #FEF3C7; color: #D97706; }
    .order-details {
      background: #F3F4F6;
      padding: 16px;
      border-radius: 8px;
      margin: 16px 0;
    }
    .order-details p {
      margin-bottom: 8px;
      font-size: 14px;
    }
    .items-list {
      list-style: none;
      padding: 0;
      margin: 16px 0;
    }
    .items-list li {
      padding: 8px 0;
      border-bottom: 1px solid #E5E7EB;
      color: #374151;
    }
    .totals {
      background: #F9FAFB;
      padding: 16px;
      border-radius: 8px;
      margin-top: 16px;
    }
    .totals p { margin-bottom: 8px; color: #6B7280; }
    .totals .total { color: #111827; font-size: 18px; margin-top: 12px; }
    h3 {
      color: #374151;
      margin-top: 20px;
      font-size: 16px;
    }
    .actions {
      margin-top: 24px;
      text-align: center;
    }
    .btn {
      display: inline-block;
      padding: 14px 28px;
      border-radius: 8px;
      text-decoration: none;
      font-weight: 600;
      font-size: 16px;
      transition: transform 0.2s, box-shadow 0.2s;
    }
    .btn:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    }
    .btn-success {
      background: #10B981;
      color: white;
    }
    .btn-danger {
      background: #EF4444;
      color: white;
    }
    .btn-secondary {
      background: #6B7280;
      color: white;
      margin-left: 12px;
    }
    .order-summary {
      background: #FEF3C7;
      padding: 16px;
      border-radius: 8px;
      margin: 16px 0;
    }
    .warning-text {
      color: #B45309;
      font-weight: 600;
      margin-top: 16px;
    }
    .logo {
      text-align: center;
      padding: 20px;
      background: #F9FAFB;
      border-top: 1px solid #E5E7EB;
    }
    .logo span {
      font-weight: bold;
      color: #374151;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>${title}</h1>
    </div>
    <div class="content">
      ${content}
    </div>
    <div class="logo">
      <span>🧢 Caps Store</span>
    </div>
  </div>
</body>
</html>`;
}

serve(handler);
