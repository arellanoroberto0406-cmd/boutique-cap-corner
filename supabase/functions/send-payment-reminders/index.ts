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

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("Starting payment reminder check...");

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Calculate 48 hours ago
    const fortyEightHoursAgo = new Date();
    fortyEightHoursAgo.setHours(fortyEightHoursAgo.getHours() - 48);

    // Get orders that are pending payment and older than 48 hours
    // Also exclude orders that have already been reminded (we'll track this)
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

    const emailsSent: string[] = [];
    const errors: string[] = [];

    for (const order of pendingOrders as PendingOrder[]) {
      if (!order.customer_email) continue;

      try {
        const hoursAgo = Math.floor((Date.now() - new Date(order.created_at).getTime()) / (1000 * 60 * 60));
        const daysAgo = Math.floor(hoursAgo / 24);

        const paymentInstructions = order.payment_method === "transfer" 
          ? `
            <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="color: #333; margin-top: 0;">Datos para Transferencia:</h3>
              ${order.spei_reference ? `
                <div style="background-color: #e3f2fd; padding: 15px; border-radius: 8px; margin-bottom: 15px; border-left: 4px solid #1976d2;">
                  <p style="margin: 0; font-weight: bold; color: #1976d2;">Tu Referencia de Pago (IMPORTANTE)</p>
                  <p style="font-size: 24px; font-weight: bold; margin: 10px 0; font-family: monospace; color: #1976d2;">${order.spei_reference}</p>
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

        const emailHtml = `
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

        const emailResponse = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${RESEND_API_KEY}`,
          },
          body: JSON.stringify({
            from: "Tienda de Gorras <onboarding@resend.dev>",
            to: [order.customer_email],
            subject: `⏰ Recordatorio: Tu pedido #${order.id.slice(0, 8).toUpperCase()} está pendiente de pago`,
            html: emailHtml,
          }),
        });

        const emailResult = await emailResponse.json();

        console.log(`Email sent to ${order.customer_email}:`, emailResult);
        emailsSent.push(order.customer_email);

        // Record the reminder in status history
        await supabase
          .from("order_status_history")
          .insert({
            order_id: order.id,
            status_type: "reminder",
            old_status: "pending",
            new_status: "reminder_sent",
            changed_by: "system",
            notes: `Recordatorio automático enviado por email a ${order.customer_email}`,
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
        emails: emailsSent,
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
