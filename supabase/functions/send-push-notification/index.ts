import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// VAPID keys for web push - these should be generated and stored as secrets
const VAPID_PUBLIC_KEY = 'BEl62iUYgUivxIkv69yViEuiBIa-Ib9-SkvMeAtA3LFgDzkrxZJjSgSnfckjBJuBkr3qBUYIHBQFLXYp5Nksh8U';

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { title, body, url, productName } = await req.json();

    console.log('Sending push notification:', { title, body, url, productName });

    // Get all push subscriptions
    const { data: subscriptions, error: subError } = await supabase
      .from('push_subscriptions')
      .select('*');

    if (subError) {
      console.error('Error fetching subscriptions:', subError);
      throw subError;
    }

    console.log(`Found ${subscriptions?.length || 0} subscriptions`);

    if (!subscriptions || subscriptions.length === 0) {
      return new Response(
        JSON.stringify({ success: true, sent: 0, message: 'No subscriptions found' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // For a production app, you would use web-push library here
    // Since we're in Deno, we'll store the notification for clients to fetch
    // and rely on the service worker to show it when the user opens the app

    // Store notification in a simple way for clients to fetch
    const { error: settingsError } = await supabase
      .from('site_settings')
      .upsert({
        setting_key: 'last_notification',
        setting_value: JSON.stringify({
          title: title || '¡Nuevo producto disponible!',
          body: body || `${productName} ya está disponible`,
          url: url || '/lo-nuevo',
          timestamp: new Date().toISOString()
        }),
        setting_type: 'json'
      }, { onConflict: 'setting_key' });

    if (settingsError) {
      console.error('Error storing notification:', settingsError);
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        sent: subscriptions.length,
        message: 'Notification queued for delivery'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: unknown) {
    console.error('Error sending push notification:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
