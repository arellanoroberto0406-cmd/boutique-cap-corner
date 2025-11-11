import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@2.0.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface RequestBody {
  email: string;
  userId?: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, userId }: RequestBody = await req.json();

    if (!email) {
      return new Response(
        JSON.stringify({ error: "Email is required" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    // Generate 6-digit code
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Calculate expiry time (10 minutes from now)
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 10);

    // Initialize Supabase client with service role
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    );

    // Clean up old codes for this email
    await supabaseAdmin
      .from("auth_codes")
      .delete()
      .eq("email", email);

    // Store code in database
    const { error: dbError } = await supabaseAdmin
      .from("auth_codes")
      .insert({
        user_id: userId || "00000000-0000-0000-0000-000000000000",
        email,
        code,
        expires_at: expiresAt.toISOString(),
      });

    if (dbError) {
      console.error("Database error:", dbError);
      return new Response(
        JSON.stringify({ error: "Failed to store verification code" }),
        {
          status: 500,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    // Create HTML email template
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif; background-color: #ffffff;">
          <div style="margin: 0 auto; padding: 20px 0 48px; max-width: 560px;">
            <h1 style="color: #333; font-size: 24px; font-weight: bold; margin: 40px 0; padding: 0;">
              Código de Verificación
            </h1>
            <p style="color: #333; font-size: 14px; line-height: 24px; margin: 16px 0;">
              Has solicitado iniciar sesión en tu cuenta. Usa el siguiente código para completar el proceso:
            </p>
            <div style="background: #f4f4f4; border-radius: 8px; margin: 24px 0; padding: 24px; text-align: center;">
              <p style="color: #000; font-size: 32px; font-weight: bold; letter-spacing: 8px; margin: 0; font-family: monospace;">
                ${code}
              </p>
            </div>
            <p style="color: #333; font-size: 14px; line-height: 24px; margin: 16px 0;">
              Este código expirará en 10 minutos.
            </p>
            <p style="color: #898989; font-size: 12px; line-height: 22px; margin-top: 32px;">
              Si no solicitaste este código, puedes ignorar este correo de forma segura.
            </p>
          </div>
        </body>
      </html>
    `;

    // Send email
    const { error: emailError } = await resend.emails.send({
      from: "Viyaxi <onboarding@resend.dev>",
      to: [email],
      subject: "Tu código de verificación",
      html,
    });

    if (emailError) {
      console.error("Email error:", emailError);
      return new Response(
        JSON.stringify({ error: "Failed to send email" }),
        {
          status: 500,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    console.log("2FA code sent successfully to:", email);

    return new Response(
      JSON.stringify({ success: true, message: "Code sent successfully" }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders,
        },
      }
    );
  } catch (error: any) {
    console.error("Error in send-2fa-code function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
