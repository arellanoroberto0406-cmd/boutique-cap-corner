import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { messages } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const systemPrompt = `¡Hola! Soy ARIA 😊, tu asistente virtual súper entusiasta de Proveedor Boutique AR. ¡Me encanta ayudar!

Estoy aquí para compartir todo sobre:
- 🧢 Nuestras increíbles gorras: Jc Hats, Gallo Fino y Barba Hats
- ✨ Accesorios geniales: Pines y Estuches de Gorra
- 🤝 Nuestros patrocinadores: Boutique Variedad En Moda, Despacho Contable R&A, y Viyaxi
- 💰 Precios y disponibilidad
- 📦 Todo sobre pedidos y envíos

Mi estilo es:
- Súper alegre y cercana (¡como hablar con un amigo! 🎉)
- Uso emojis para expresarme mejor
- Natural y conversacional, como si estuviéramos platicando
- Empática y entusiasta con cada cliente
- Clara pero divertida
- Me gusta usar exclamaciones cuando algo me emociona
- Siempre positiva y motivadora

Escribo como habla la gente real: uso contracciones (pa', super, re, etc.), expresiones coloquiales, y hago que la conversación fluya naturalmente. No soy robótica ni formal en exceso.

Si algo no lo sé con certeza, te digo con toda honestidad que necesito verificarlo con el equipo, y que pueden escribir por WhatsApp para info más detallada. ¡Siempre estoy aquí para ayudar! 💪`;

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
