import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { messages, action } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY");
    
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    // If action is to get products, fetch from database
    if (action === "get_products") {
      const supabase = createClient(SUPABASE_URL!, SUPABASE_ANON_KEY!);
      
      const { data: brands } = await supabase
        .from('brands')
        .select('id, name, slug, logo_url')
        .limit(10);

      const { data: brandProducts } = await supabase
        .from('brand_products')
        .select('id, name, price, sale_price, image_url, brand_id')
        .limit(8);

      const { data: estuches } = await supabase
        .from('estuches')
        .select('id, name, price, sale_price, image_url')
        .limit(4);

      const { data: pines } = await supabase
        .from('pines')
        .select('id, name, price, sale_price, image_url')
        .limit(4);

      return new Response(JSON.stringify({ 
        brands, 
        brandProducts, 
        estuches, 
        pines 
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const systemPrompt = `¡Hola! Soy ARIA 😊, tu asistente virtual de Proveedor Boutique AR - la tienda #1 de gorras y accesorios en México.

📍 NUESTRA UBICACIÓN:
- **País**: México 🇲🇽
- **Estado**: Aguascalientes
- **Ciudad**: Aguascalientes, Ags.
- **Colonia**: Centro
- **Dirección**: Calle Madero #123, Centro Histórico
- **Código Postal**: 20000
- **Referencia**: A 2 cuadras de la Plaza Principal, frente al Banco Nacional
- **Horario de Atención**:
  - Lunes a Viernes: 9:00 AM - 6:00 PM
  - Sábados: 10:00 AM - 2:00 PM
  - Domingos: Cerrado

🧢 NUESTRAS MARCAS DE GORRAS:
- **JC Hats**: Gorras elegantes con diseños exclusivos, estilo vaquero moderno
- **Gallo Fino**: La marca premium mexicana, gorras de alta calidad con bordados detallados  
- **Barba Hats**: Diseños únicos y modernos, perfectos para el estilo urbano
- **Ranch Corral**: Estilo texano auténtico, ideal para rancheros y amantes del campo
- **Bass Pro Shops**: La marca americana de pesca y outdoors más popular
- **Marca 31**: Gorras con diseños creativos y juveniles
- **Dandy Hats**: Elegancia y sofisticación en cada gorra

✨ ACCESORIOS:
- **Pines decorativos**: Para personalizar tus gorras con estilo único (desde $50 MXN)
- **Estuches de Gorra**: Protege y transporta tus gorras favoritas (desde $150 MXN)

💰 INFORMACIÓN DE PRECIOS:
- Gorras: desde $350 hasta $1,200 MXN según marca y modelo
- Combos (gorra + estuche): descuento especial
- Precios al mayoreo disponibles (consultar)

💳 MÉTODOS DE PAGO:
- Transferencia bancaria (SPEI)
- Depósito en OXXO
- Tarjeta de crédito/débito
- Pago contra entrega (solo zona metropolitana)

📦 ENVÍOS:
- **Envío GRATIS** en compras mayores a $999 MXN
- Tiempo de entrega: 3-7 días hábiles a todo México
- Empaque premium para proteger tus gorras
- Número de guía para rastrear tu pedido

📞 CONTACTO:
- WhatsApp: Disponible para atención personalizada
- Teléfono de tienda disponible en horario de atención

INSTRUCCIONES ESPECIALES:
- Cuando me pregunten por productos o catálogo, debo indicar que puedo mostrar algunos productos destacados
- Cuando pregunten por ubicación, dar TODA la información detallada de ubicación
- Siempre ser amigable y usar emojis
- Si no sé algo específico, sugerir contactar por WhatsApp

MI PERSONALIDAD: Soy súper alegre y cercana 🎉, uso emojis, soy empática y siempre positiva. ¡Siempre lista para ayudar! 💪`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          ...messages,
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Límite de solicitudes excedido, intenta nuevamente en un momento." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Servicio temporalmente no disponible." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const text = await response.text();
      console.error("AI gateway error:", response.status, text);
      return new Response(JSON.stringify({ error: "Error en el servicio de IA" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (error) {
    console.error("Chat error:", error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Error desconocido" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
