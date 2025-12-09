import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const paymentMethodLabels: Record<string, string> = {
  transfer: "Transferencia Bancaria",
  oxxo: "OXXO",
  kiosko: "Kiosco",
  stripe: "Tarjeta",
};

const bankInfo = {
  bank: "KLAR",
  accountName: "GABRIEL ARELLANO",
  clabe: "661610006945761800",
};

interface PendingOrder {
  id: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  payment_method: string;
  total: number;
  spei_reference: string | null;
  created_at: string;
}

type ReminderType = "first_reminder" | "urgent_reminder";

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("Starting payment reminder check...");

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Calculate time thresholds
    const fortyEightHoursAgo = new Date();
    fortyEightHoursAgo.setHours(fortyEightHoursAgo.getHours() - 48);
    
    const seventyTwoHoursAgo = new Date();
    seventyTwoHoursAgo.setHours(seventyTwoHoursAgo.getHours() - 72);

    // Get all pending orders older than 48 hours
    const { data: pendingOrders, error: fetchError } = await supabase
      .from("orders")
      .select("id, customer_name, customer_email, customer_phone, payment_method, total, spei_reference, created_at")
      .eq("payment_status", "pending")
      .not("customer_email", "is", null)
      .lt("created_at", fortyEightHoursAgo.toISOString())
      .order("created_at", { ascending: true });

    if (fetchError) {
      console.error("Error fetching pending orders:", fetchError);
      throw fetchError;
    }

    console.log(`Found ${pendingOrders?.length || 0} orders pending payment for more than 48 hours`);

    if (!pendingOrders || pendingOrders.length === 0) {
      return new Response(
        JSON.stringify({ message: "No pending orders to remind", count: 0 }),
        { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Get existing reminders for these orders
    const orderIds = pendingOrders.map(o => o.id);
    const { data: existingReminders } = await supabase
      .from("order_status_history")
      .select("order_id, new_status")
      .in("order_id", orderIds)
      .eq("status_type", "reminder");

    // Build a map of which reminders have been sent
    const remindersSent = new Map<string, Set<string>>();
    existingReminders?.forEach(r => {
      if (!remindersSent.has(r.order_id)) {
        remindersSent.set(r.order_id, new Set());
      }
      remindersSent.get(r.order_id)!.add(r.new_status);
    });

    const emailsSent: { email: string; type: ReminderType }[] = [];
    const errors: string[] = [];

    for (const order of pendingOrders as PendingOrder[]) {
      if (!order.customer_email) continue;

      const hoursAgo = Math.floor((Date.now() - new Date(order.created_at).getTime()) / (1000 * 60 * 60));
      const orderReminders = remindersSent.get(order.id) || new Set();

      // Determine which reminder to send
      let reminderType: ReminderType | null = null;
      
      if (hoursAgo >= 72 && !orderReminders.has("urgent_reminder")) {
        reminderType = "urgent_reminder";
      } else if (hoursAgo >= 48 && hoursAgo < 72 && !orderReminders.has("first_reminder")) {
        reminderType = "first_reminder";
      } else if (hoursAgo >= 72 && !orderReminders.has("first_reminder") && !orderReminders.has("urgent_reminder")) {
        // If order is >72h but never got first reminder, send urgent directly
        reminderType = "urgent_reminder";
      }

      if (!reminderType) {
        console.log(`Order ${order.id} already received appropriate reminders, skipping`);
        continue;
      }

      try {
        const daysAgo = Math.floor(hoursAgo / 24);
        const isUrgent = reminderType === "urgent_reminder";

        const paymentInstructions = order.payment_method === "transfer" 
          ? `
            <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="color: #333; margin-top: 0;">Datos para Transferencia:</h3>
              ${order.spei_reference ? `
                <div style="background-color: ${isUrgent ? '#ffebee' : '#e3f2fd'}; padding: 15px; border-radius: 8px; margin-bottom: 15px; border-left: 4px solid ${isUrgent ? '#d32f2f' : '#1976d2'};">
                  <p style="margin: 0; font-weight: bold; color: ${isUrgent ? '#d32f2f' : '#1976d2'};">Tu Referencia de Pago (IMPORTANTE)</p>
                  <p style="font-size: 24px; font-weight: bold; margin: 10px 0; font-family: monospace; color: ${isUrgent ? '#d32f2f' : '#1976d2'};">${order.spei_reference}</p>
                  <p style="margin: 0; font-size: 12px; color: #666;">Incluye esta referencia en el concepto de tu transferencia</p>
                </div>
              ` : ''}
              <p><strong>Banco:</strong> ${bankInfo.bank}</p>
              <p><strong>Beneficiario:</strong> ${bankInfo.accountName}</p>
              <p><strong>CLABE:</strong> <span style="font-family: monospace; font-weight: bold;">${bankInfo.clabe}</span></p>
            </div>
          `
          : `
            <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="color: #333; margin-top: 0;">Método de Pago: ${paymentMethodLabels[order.payment_method] || order.payment_method}</h3>
              ${order.spei_reference ? `<p><strong>Referencia:</strong> <span style="font-family: monospace; font-weight: bold;">${order.spei_reference}</span></p>` : ''}
              <p>Si necesitas ayuda para completar tu pago, contáctanos por WhatsApp.</p>
            </div>
          `;

        // Different email content based on urgency
        const emailHtml = isUrgent ? `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
          </head>
          <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="text-align: center; margin-bottom: 30px; background-color: #ffebee; padding: 20px; border-radius: 8px;">
              <h1 style="color: #d32f2f; margin-bottom: 10px;">🚨 ÚLTIMO AVISO - Pedido por Cancelar</h1>
            </div>
            
            <p>Hola <strong>${order.customer_name}</strong>,</p>
            
            <p style="color: #d32f2f; font-weight: bold;">Tu pedido <strong>#${order.id.slice(0, 8).toUpperCase()}</strong> lleva <strong>${daysAgo} días</strong> sin pagar y está próximo a ser cancelado.</p>
            
            <div style="background-color: #ffebee; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #d32f2f;">
              <p style="margin: 0; font-size: 18px;"><strong>⚠️ Si no recibimos tu pago en las próximas 24 horas, tu pedido será cancelado automáticamente.</strong></p>
            </div>
            
            <div style="background-color: #fff3cd; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #ffc107;">
              <p style="margin: 0;"><strong>Total a pagar: $${order.total.toFixed(2)} MXN</strong></p>
            </div>
            
            ${paymentInstructions}
            
            <p><strong>¿Ya pagaste?</strong> Envíanos tu comprobante inmediatamente para evitar la cancelación.</p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="https://wa.me/526692646083?text=${encodeURIComponent(`🚨 URGENTE: Ya realicé el pago de mi pedido #${order.id.slice(0, 8).toUpperCase()}${order.spei_reference ? ` con referencia ${order.spei_reference}` : ''}. Por favor no lo cancelen. Adjunto mi comprobante.`)}" 
                 style="display: inline-block; background-color: #d32f2f; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px;">
                🚨 ENVIAR COMPROBANTE AHORA
              </a>
            </div>
            
            <p style="color: #666; font-size: 14px;">Si decidiste no continuar con tu compra, no es necesario que hagas nada y tu pedido será cancelado.</p>
            
            <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
            
            <p style="color: #999; font-size: 12px; text-align: center;">
              Este es un mensaje automático. Si tienes dudas, contáctanos por WhatsApp al 669 264 6083.
            </p>
          </body>
          </html>
        ` : `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
          </head>
          <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="color: #333; margin-bottom: 10px;">⏰ Recordatorio de Pago</h1>
            </div>
            
            <p>Hola <strong>${order.customer_name}</strong>,</p>
            
            <p>Te recordamos que tu pedido <strong>#${order.id.slice(0, 8).toUpperCase()}</strong> realizado hace <strong>${daysAgo > 0 ? `${daysAgo} día${daysAgo > 1 ? 's' : ''}` : `${hoursAgo} horas`}</strong> aún está pendiente de pago.</p>
            
            <div style="background-color: #fff3cd; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #ffc107;">
              <p style="margin: 0;"><strong>Total a pagar: $${order.total.toFixed(2)} MXN</strong></p>
            </div>
            
            ${paymentInstructions}
            
            <p>Una vez realizado tu pago, envíanos tu comprobante por WhatsApp para procesar tu pedido de inmediato.</p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="https://wa.me/526692646083?text=${encodeURIComponent(`Hola! Ya realicé el pago de mi pedido #${order.id.slice(0, 8).toUpperCase()}${order.spei_reference ? ` con referencia ${order.spei_reference}` : ''}. Adjunto mi comprobante.`)}" 
                 style="display: inline-block; background-color: #25D366; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold;">
                📱 Enviar Comprobante por WhatsApp
              </a>
            </div>
            
            <p style="color: #666; font-size: 14px;">Si ya realizaste tu pago, por favor ignora este mensaje. Si decidiste no continuar con tu compra, no es necesario que hagas nada.</p>
            
            <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
            
            <p style="color: #999; font-size: 12px; text-align: center;">
              Este es un mensaje automático. Si tienes dudas, contáctanos por WhatsApp al 669 264 6083.
            </p>
          </body>
          </html>
        `;

        const subject = isUrgent 
          ? `🚨 ÚLTIMO AVISO: Tu pedido #${order.id.slice(0, 8).toUpperCase()} será cancelado`
          : `⏰ Recordatorio: Tu pedido #${order.id.slice(0, 8).toUpperCase()} está pendiente de pago`;

        const emailResponse = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${RESEND_API_KEY}`,
          },
          body: JSON.stringify({
            from: "Tienda de Gorras <onboarding@resend.dev>",
            to: [order.customer_email],
            subject,
            html: emailHtml,
          }),
        });

        const emailResult = await emailResponse.json();

        console.log(`${reminderType} email sent to ${order.customer_email}:`, emailResult);
        emailsSent.push({ email: order.customer_email, type: reminderType });

        // Record the reminder in status history
        await supabase
          .from("order_status_history")
          .insert({
            order_id: order.id,
            status_type: "reminder",
            old_status: "pending",
            new_status: reminderType,
            changed_by: "system",
            notes: `${isUrgent ? 'Recordatorio URGENTE' : 'Primer recordatorio'} enviado por email a ${order.customer_email}`,
          });

      } catch (emailError: any) {
        console.error(`Error sending email to ${order.customer_email}:`, emailError);
        errors.push(`${order.customer_email}: ${emailError.message}`);
      }
    }

    return new Response(
      JSON.stringify({
        message: "Payment reminders processed",
        emailsSent: emailsSent.length,
        details: emailsSent,
        errors: errors.length > 0 ? errors : undefined,
      }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );

  } catch (error: any) {
    console.error("Error in send-payment-reminders function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);
